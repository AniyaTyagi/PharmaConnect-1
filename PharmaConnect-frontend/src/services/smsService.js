// SMS Service for sending real OTPs
class SMSService {
  constructor() {
    this.provider = 'twilio'; // Options: 'twilio', 'msg91', 'fast2sms', 'textlocal'
  }

  // Twilio Implementation
  async sendViaTwilio(phone, otp) {
    try {
      const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
      const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
      const fromNumber = import.meta.env.VITE_TWILIO_PHONE_NUMBER;

      if (!accountSid || !authToken || !fromNumber) {
        throw new Error('Twilio credentials not configured');
      }

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: `+91${phone}`,
          From: fromNumber,
          Body: `Your PharmaConnect verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`
        })
      });

      if (!response.ok) throw new Error('Failed to send SMS');
      return { success: true, provider: 'twilio' };
    } catch (error) {
      console.error('Twilio error:', error);
      throw error;
    }
  }

  // MSG91 Implementation (Popular in India)
  async sendViaMSG91(phone, otp) {
    try {
      const apiKey = import.meta.env.VITE_MSG91_API_KEY;
      const templateId = import.meta.env.VITE_MSG91_TEMPLATE_ID;

      if (!apiKey) throw new Error('MSG91 credentials not configured');

      const response = await fetch('https://api.msg91.com/api/v5/otp', {
        method: 'POST',
        headers: {
          'authkey': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_id: templateId,
          mobile: `91${phone}`,
          otp: otp
        })
      });

      if (!response.ok) throw new Error('Failed to send SMS');
      return { success: true, provider: 'msg91' };
    } catch (error) {
      console.error('MSG91 error:', error);
      throw error;
    }
  }

  // Fast2SMS Implementation (Indian SMS Gateway)
  async sendViaFast2SMS(phone, otp) {
    try {
      const apiKey = import.meta.env.VITE_FAST2SMS_API_KEY;

      if (!apiKey) throw new Error('Fast2SMS credentials not configured');

      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          sender_id: 'PHARMA',
          message: `Your PharmaConnect OTP is ${otp}. Valid for 5 minutes.`,
          variables_values: otp,
          numbers: phone
        })
      });

      if (!response.ok) throw new Error('Failed to send SMS');
      return { success: true, provider: 'fast2sms' };
    } catch (error) {
      console.error('Fast2SMS error:', error);
      throw error;
    }
  }

  // Generic SMS Gateway Implementation
  async sendViaGenericAPI(phone, otp) {
    try {
      const apiUrl = import.meta.env.VITE_SMS_API_URL;
      const apiKey = import.meta.env.VITE_SMS_API_KEY;

      if (!apiUrl || !apiKey) throw new Error('SMS API credentials not configured');

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phone,
          message: `Your PharmaConnect verification code is: ${otp}. Valid for 5 minutes.`
        })
      });

      if (!response.ok) throw new Error('Failed to send SMS');
      return { success: true, provider: 'generic' };
    } catch (error) {
      console.error('Generic API error:', error);
      throw error;
    }
  }

  // Main send method with fallback
  async sendOTP(phone, otp) {
    // Try configured provider first
    try {
      switch (this.provider) {
        case 'twilio':
          return await this.sendViaTwilio(phone, otp);
        case 'msg91':
          return await this.sendViaMSG91(phone, otp);
        case 'fast2sms':
          return await this.sendViaFast2SMS(phone, otp);
        default:
          return await this.sendViaGenericAPI(phone, otp);
      }
    } catch (error) {
      // Fallback to demo mode if SMS fails
      console.warn('SMS sending failed, using demo mode:', error.message);
      console.log(`📱 DEMO OTP for ${phone}: ${otp}`);
      return { success: true, provider: 'demo', otp }; // Return OTP in demo mode
    }
  }
}

export const smsService = new SMSService();
