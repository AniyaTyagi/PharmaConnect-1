// Controller: Business Logic for Registration and OTP
import { RegistrationModel } from '../models/RegistrationModel';
import { FirebaseSMSService } from '../services/firebaseSMSService';
import axiosInstance from '../utils/axiosInstance';

const OTP_STORAGE_KEY = 'otpData';

export class RegistrationController {
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async sendOTP(phone) {
    try {
      const result = await FirebaseSMSService.sendOTP(phone);
      if (result.success) {
        const otpData = { phone, verified: false, sentAt: Date.now() };
        localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otpData));
      }
      return result;
    } catch (error) {
      return { success: false, message: 'Failed to send OTP. Please try again.' };
    }
  }

  static async verifyOTP(phone, otp) {
    const result = await FirebaseSMSService.verifyOTP(otp);
    if (result.success) {
      const otpData = { phone, verified: true, verifiedAt: new Date().toISOString() };
      localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otpData));
    }
    return result;
  }

  static async createRegistration(data) {
    const otpData = JSON.parse(localStorage.getItem(OTP_STORAGE_KEY) || '{}');
    if (!otpData.verified || otpData.phone !== data.phone) {
      return { success: false, errors: { phone: 'Phone number not verified' } };
    }
    const registration = new RegistrationModel(data);
    const validation = registration.validate();
    if (!validation.isValid) return { success: false, errors: validation.errors };

    try {
      const payload = {
        name: data.contactPerson,
        email: data.email,
        password: data.password || data.phone,
        role: data.userType === 'seller' ? 'manufacturer' : 'wholesaler',
        businessName: data.businessName,
        contactPerson: data.contactPerson,
        licenseNumber: data.licenseNumber,
        gstNumber: data.gstNumber,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        drugLicense: data.drugLicense,
        manufacturingLicense: data.manufacturingLicense,
      };
      await axiosInstance.post('/verification/submit', payload);
      localStorage.removeItem(OTP_STORAGE_KEY);
      return { success: true };
    } catch (err) {
      return { success: false, errors: { email: err.response?.data?.message || 'Submission failed' } };
    }
  }

  static async getAllRegistrations() {
    const res = await axiosInstance.get('/api/verification/');
    return res.data;
  }

  static async getApprovedRegistrations() {
    const res = await axiosInstance.get('/api/admin/approved');
    return res.data;
  }

  static async approveRegistration(id) {
    await axiosInstance.put(`/api/verification/approve/${id}`);
    return { success: true };
  }

  static async rejectRegistration(id, reason) {
    await axiosInstance.put(`/api/verification/reject/${id}`, { reason });
    return { success: true };
  }

  static async deleteRegistration(id) {
    await axiosInstance.delete(`/api/verification/${id}`);
    return { success: true };
  }
}
