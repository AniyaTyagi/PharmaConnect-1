# SMS OTP Configuration Guide

## Overview
The system supports multiple SMS providers for sending real OTPs to user phone numbers. Configure your preferred provider in the `.env` file.

## Supported Providers

### 1. Twilio (International)
**Best for**: Global coverage, reliable delivery

**Setup Steps:**
1. Sign up at https://www.twilio.com
2. Get your Account SID and Auth Token from dashboard
3. Purchase a phone number
4. Add to `.env`:
```env
VITE_TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_TWILIO_AUTH_TOKEN=your_auth_token
VITE_TWILIO_PHONE_NUMBER=+1234567890
```

**Pricing**: ~$0.0075 per SMS (India)

---

### 2. MSG91 (India)
**Best for**: Indian market, cost-effective

**Setup Steps:**
1. Sign up at https://msg91.com
2. Get API Key from dashboard
3. Create OTP template and get Template ID
4. Add to `.env`:
```env
VITE_MSG91_API_KEY=your_api_key
VITE_MSG91_TEMPLATE_ID=your_template_id
```

**Pricing**: ~₹0.15 per SMS

---

### 3. Fast2SMS (India)
**Best for**: Quick setup, Indian numbers

**Setup Steps:**
1. Sign up at https://www.fast2sms.com
2. Get API Key from dashboard
3. Add to `.env`:
```env
VITE_FAST2SMS_API_KEY=your_api_key
```

**Pricing**: ~₹0.10 per SMS

---

### 4. TextLocal (India)
**Setup Steps:**
1. Sign up at https://www.textlocal.in
2. Get API Key
3. Use generic API configuration

---

## Configuration

### Step 1: Choose Provider
Edit `src/services/smsService.js`:
```javascript
constructor() {
  this.provider = 'msg91'; // Change to: 'twilio', 'msg91', 'fast2sms'
}
```

### Step 2: Add Credentials
Create/edit `.env` file in project root with your provider credentials.

### Step 3: Test
Run the application and try registration. Check console for SMS status.

## Demo Mode
If no credentials are configured, the system automatically falls back to **Demo Mode**:
- OTP is displayed in browser alert
- OTP is logged to console
- No actual SMS is sent
- Perfect for development/testing

## Phone Number Format
- **India**: Enter 10 digits (e.g., 9876543210)
- System automatically adds country code (+91)
- For other countries, modify the format in `smsService.js`

## Security Best Practices

1. **Never commit `.env` file** - Already in `.gitignore`
2. **Use environment variables** - Don't hardcode credentials
3. **Rotate API keys** regularly
4. **Monitor usage** to prevent abuse
5. **Rate limit** OTP requests (implement in production)

## Production Recommendations

### For Indian Market:
- **Primary**: MSG91 or Fast2SMS
- **Backup**: Twilio
- **Cost**: ~₹0.10-0.15 per OTP

### For Global Market:
- **Primary**: Twilio
- **Backup**: AWS SNS
- **Cost**: ~$0.0075 per OTP

## Troubleshooting

### OTP Not Received
1. Check provider dashboard for delivery status
2. Verify phone number format
3. Check API credentials in `.env`
4. Review console logs for errors
5. Ensure sufficient balance in provider account

### Demo Mode Activating
- Provider credentials not configured
- API request failing
- Check console for specific error

## Testing

### Test Phone Numbers (Twilio)
Twilio provides test numbers that don't send real SMS:
- +15005550006 (Valid number)
- Check Twilio docs for more test numbers

### Test in Demo Mode
1. Don't configure any provider
2. System shows OTP in alert
3. Use displayed OTP to verify

## Admin Verification Flow

1. **User Registration**:
   - User enters phone number
   - Real OTP sent via SMS provider
   - User verifies OTP
   - Phone marked as verified ✅

2. **Admin Review**:
   - Admin sees "Phone Verified: ✅ Yes"
   - Admin reviews business credentials
   - Admin approves/rejects registration
   - Status marked as "Admin Verified: ✅ Yes"

3. **Double Verification**:
   - Phone verified by OTP (automated)
   - Business verified by admin (manual)
   - Both required for account activation

## Cost Estimation

### For 1000 registrations/month:
- **MSG91**: ₹150 (~$1.80)
- **Fast2SMS**: ₹100 (~$1.20)
- **Twilio**: $7.50

### Optimization Tips:
1. Cache OTP for 5 minutes (avoid resend spam)
2. Implement rate limiting (max 3 OTPs per hour per number)
3. Use transactional route (cheaper than promotional)
4. Monitor failed deliveries and retry logic

## Support

For provider-specific issues:
- **Twilio**: https://support.twilio.com
- **MSG91**: https://msg91.com/help
- **Fast2SMS**: https://www.fast2sms.com/support

For application issues, check console logs and verify configuration.
