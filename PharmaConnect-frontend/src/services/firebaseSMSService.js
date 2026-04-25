import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../config/firebase';

export class FirebaseSMSService {
  static setupRecaptcha(containerId) {
    if (!window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
          'size': 'normal',
          'callback': (response) => {
            console.log('reCAPTCHA solved');
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired');
            window.recaptchaVerifier = null;
          }
        });
        window.recaptchaVerifier.render();
      } catch (error) {
        console.error('reCAPTCHA setup error:', error);
      }
    }
    return window.recaptchaVerifier;
  }

  static async sendOTP(phoneNumber) {
    try {
      // Ensure phone number has country code
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      
      // Setup reCAPTCHA
      const recaptchaVerifier = this.setupRecaptcha('recaptcha-container');
      
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
      
      // Store confirmation result globally for verification
      window.confirmationResult = confirmationResult;
      
      return { 
        success: true, 
        message: 'OTP sent successfully to your phone',
        confirmationResult 
      };
    } catch (error) {
      console.error('Error sending OTP:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Reset reCAPTCHA on error
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {}
        window.recaptchaVerifier = null;
      }
      
      let message = 'Failed to send OTP. ';
      if (error.code === 'auth/invalid-phone-number') {
        message += 'Invalid phone number format. Use format: 9876543210';
      } else if (error.code === 'auth/too-many-requests') {
        message += 'Too many requests. Please try again later';
      } else if (error.code === 'auth/invalid-app-credential') {
        message += 'reCAPTCHA verification failed. Please check the reCAPTCHA box and try again.';
      } else {
        message += error.message || 'Please try again.';
      }
      
      return { success: false, message };
    }
  }

  static async verifyOTP(otp) {
    try {
      if (!window.confirmationResult) {
        return { success: false, message: 'Please request OTP first' };
      }
      
      const result = await window.confirmationResult.confirm(otp);
      
      // User signed in successfully
      const user = result.user;
      
      return { 
        success: true, 
        message: 'Phone verified successfully',
        user 
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      
      let message = 'Invalid OTP. Please try again.';
      if (error.code === 'auth/invalid-verification-code') {
        message = 'Invalid OTP code';
      } else if (error.code === 'auth/code-expired') {
        message = 'OTP expired. Please request a new one';
      }
      
      return { success: false, message };
    }
  }

  static cleanup() {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    window.confirmationResult = null;
  }
}