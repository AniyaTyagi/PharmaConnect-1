# PharmaConnect

## Enterprise Authentication System

### Features
- **Real OTP Verification**: SMS sent to user's phone via Twilio/MSG91/Fast2SMS
- **Dual Verification**: Phone verified by OTP + Business verified by admin
- **MVC Architecture**: Clean separation with Models, Controllers, Views
- **CRUD Operations**: Full admin panel for managing registrations
- **Radix UI**: Accessible, enterprise-grade components

### Quick Start
1. `npm install`
2. Configure SMS provider in `.env` (see SMS_SETUP_GUIDE.md)
3. `npm run dev`
4. Register at login page → Verify OTP → Submit credentials
5. Admin reviews at `/admin/registrations`

### Documentation
- [Authentication System](./AUTHENTICATION_SYSTEM.md)
- [SMS Setup Guide](./SMS_SETUP_GUIDE.md)
