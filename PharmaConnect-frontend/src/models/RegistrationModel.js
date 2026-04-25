// Model: Registration Data Structure and Validation
export class RegistrationModel {
  constructor(data) {
    this.userType = data.userType;
    this.businessName = data.businessName;
    this.licenseNumber = data.licenseNumber;
    this.gstNumber = data.gstNumber;
    this.email = data.email;
    this.phone = data.phone;
    this.address = data.address;
    this.city = data.city;
    this.state = data.state;
    this.pincode = data.pincode;
    this.contactPerson = data.contactPerson;
    this.drugLicense = data.drugLicense;
    this.manufacturingLicense = data.manufacturingLicense;
    this.status = 'pending';
    this.createdAt = new Date().toISOString();
    this.id = Date.now();
  }

  validate() {
    const errors = {};
    if (!this.businessName) errors.businessName = 'Business name is required';
    if (!this.licenseNumber) errors.licenseNumber = 'License number is required';
    if (!this.gstNumber) errors.gstNumber = 'GST number is required';
    if (!this.email || !/\S+@\S+\.\S+/.test(this.email)) errors.email = 'Valid email is required';
    if (!this.phone || !/^\d{10}$/.test(this.phone)) errors.phone = 'Valid 10-digit phone is required';
    if (!this.address) errors.address = 'Address is required';
    if (!this.city) errors.city = 'City is required';
    if (!this.state) errors.state = 'State is required';
    if (!this.pincode || !/^\d{6}$/.test(this.pincode)) errors.pincode = 'Valid 6-digit pincode is required';
    if (!this.contactPerson) errors.contactPerson = 'Contact person is required';
    
    if (this.userType === 'seller') {
      if (!this.drugLicense) errors.drugLicense = 'Drug license is required';
      if (!this.manufacturingLicense) errors.manufacturingLicense = 'Manufacturing license is required';
    }
    
    return { isValid: Object.keys(errors).length === 0, errors };
  }

  toJSON() {
    return {
      id: this.id,
      userType: this.userType,
      businessName: this.businessName,
      licenseNumber: this.licenseNumber,
      gstNumber: this.gstNumber,
      email: this.email,
      phone: this.phone,
      address: this.address,
      city: this.city,
      state: this.state,
      pincode: this.pincode,
      contactPerson: this.contactPerson,
      drugLicense: this.drugLicense,
      manufacturingLicense: this.manufacturingLicense,
      status: this.status,
      createdAt: this.createdAt
    };
  }
}
