import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { RegistrationController } from '../controllers/RegistrationController';
import { FirebaseSMSService } from '../services/firebaseSMSService';
import '../styles/registration.css';

const RegistrationForm = ({ open, onClose }) => {
  const [userType, setUserType] = useState('buyer');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '', licenseNumber: '', gstNumber: '', email: '', phone: '',
    address: '', city: '', state: '', pincode: '', contactPerson: '',
    drugLicense: '', manufacturingLicense: '', password: ''
  });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoOTP, setDemoOTP] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    return () => {
      FirebaseSMSService.cleanup();
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSendOTP = async () => {
    if (!/^\d{10}$/.test(formData.phone)) {
      setErrors({ ...errors, phone: 'Valid 10-digit phone required' });
      return;
    }
    
    const result = await RegistrationController.sendOTP(formData.phone);
    
    if (result.success) {
      setOtpSent(true);
      if (result.demo) {
        setDemoOTP(result.otp);
        alert(`Demo Mode: Your OTP is ${result.otp}`);
      } else {
        alert('OTP sent to your phone number!');
      }
    } else {
      alert(result.message);
    }
  };

  const handleVerifyOTP = async () => {
    const result = await RegistrationController.verifyOTP(formData.phone, otp);
    if (result.success) {
      setStep(2);
      setOtpSent(false);
    } else {
      alert(result.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await RegistrationController.createRegistration({ ...formData, userType });
    if (result.success) {
      alert('Registration submitted! Awaiting admin approval.');
      onClose();
      setStep(1);
      setFormData({
        businessName: '', licenseNumber: '', gstNumber: '', email: '', phone: '',
        address: '', city: '', state: '', pincode: '', contactPerson: '',
        drugLicense: '', manufacturingLicense: '', password: ''
      });
    } else {
      setErrors(result.errors);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <Dialog.Title className="dialog-title">Business Registration</Dialog.Title>
          
          <Tabs.Root value={userType} onValueChange={setUserType}>
            <Tabs.List className="tabs-list">
              <Tabs.Trigger value="buyer" className="tabs-trigger">Wholesale Buyer</Tabs.Trigger>
              <Tabs.Trigger value="seller" className="tabs-trigger">Manufacturer/Seller</Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>

          {step === 1 && (
            <div className="otp-section">
              <h3>Step 1: Verify Phone Number</h3>
              <div className="form-group">
                <label>Phone Number</label>
                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="10-digit phone" />
                {errors.phone && <span className="error">{errors.phone}</span>}
              </div>
              <div id="recaptcha-container" style={{ marginBottom: '1rem' }}></div>
              {!otpSent ? (
                <button onClick={handleSendOTP} className="btn-primary">Send OTP</button>
              ) : (
                <>
                  {demoOTP && (
                    <div className="demo-otp-display">
                      <p>🔐 Demo Mode - Your OTP: <strong>{demoOTP}</strong></p>
                    </div>
                  )}
                  <div className="form-group">
                    <label>Enter OTP</label>
                    <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit OTP" maxLength="6" />
                  </div>
                  <div className="otp-actions">
                    <button onClick={handleVerifyOTP} className="btn-primary">Verify OTP</button>
                    <button onClick={handleSendOTP} className="btn-secondary">Resend OTP</button>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="registration-form">
              <h3>Step 2: Business Details</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Business Name *</label>
                  <input name="businessName" value={formData.businessName} onChange={handleChange} />
                  {errors.businessName && <span className="error">{errors.businessName}</span>}
                </div>
                <div className="form-group">
                  <label>Contact Person *</label>
                  <input name="contactPerson" value={formData.contactPerson} onChange={handleChange} />
                  {errors.contactPerson && <span className="error">{errors.contactPerson}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>License Number *</label>
                  <input name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} />
                  {errors.licenseNumber && <span className="error">{errors.licenseNumber}</span>}
                </div>
                <div className="form-group">
                  <label>GST Number *</label>
                  <input name="gstNumber" value={formData.gstNumber} onChange={handleChange} />
                  {errors.gstNumber && <span className="error">{errors.gstNumber}</span>}
                </div>
              </div>

              {userType === 'seller' && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Drug License *</label>
                    <input name="drugLicense" value={formData.drugLicense} onChange={handleChange} />
                    {errors.drugLicense && <span className="error">{errors.drugLicense}</span>}
                  </div>
                  <div className="form-group">
                    <label>Manufacturing License *</label>
                    <input name="manufacturingLicense" value={formData.manufacturingLicense} onChange={handleChange} />
                    {errors.manufacturingLicense && <span className="error">{errors.manufacturingLicense}</span>}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Email *</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} />
                {errors.email && <span className="error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label>Password *</label>
                <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Set your login password" />
                {errors.password && <span className="error">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label>Address *</label>
                <textarea name="address" value={formData.address} onChange={handleChange} rows="2" />
                {errors.address && <span className="error">{errors.address}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input name="city" value={formData.city} onChange={handleChange} />
                  {errors.city && <span className="error">{errors.city}</span>}
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input name="state" value={formData.state} onChange={handleChange} />
                  {errors.state && <span className="error">{errors.state}</span>}
                </div>
                <div className="form-group">
                  <label>Pincode *</label>
                  <input name="pincode" value={formData.pincode} onChange={handleChange} />
                  {errors.pincode && <span className="error">{errors.pincode}</span>}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary">Back</button>
                <button type="submit" className="btn-primary">Submit Registration</button>
              </div>
            </form>
          )}

          <Dialog.Close className="dialog-close">✕</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default RegistrationForm;