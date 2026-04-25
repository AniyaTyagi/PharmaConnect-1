# Enterprise Authentication System - PharmaConnect

## Overview
Enterprise-level authentication system with registration forms for buyers and sellers, OTP verification using Radix UI, and admin approval workflow following MVC architecture.

## Architecture

### MVC Pattern Implementation

#### Models (`src/models/`)
- **RegistrationModel.js**: Data structure and validation logic for registration forms
  - Validates all required fields (business name, licenses, GST, contact info)
  - Separate validation for buyer vs seller (sellers require drug & manufacturing licenses)
  - Converts data to JSON format for storage

#### Controllers (`src/controllers/`)
- **RegistrationController.js**: Business logic layer
  - `generateOTP()`: Creates 6-digit OTP
  - `sendOTP(phone)`: Sends OTP to phone (console log for demo)
  - `verifyOTP(phone, otp)`: Validates OTP with 5-minute expiry
  - `createRegistration(data)`: Creates new registration with validation
  - `getAllRegistrations()`: Retrieves all registrations
  - `getRegistrationById(id)`: Gets specific registration
  - `updateRegistration(id, updates)`: Updates registration data
  - `deleteRegistration(id)`: Removes registration
  - `approveRegistration(id)`: Approves pending registration
  - `rejectRegistration(id, reason)`: Rejects with reason

#### Views (`src/views/`)
- **RegistrationForm.jsx**: User-facing registration form with Radix UI
  - Two-step process: OTP verification → Business details
  - Tabs for Buyer/Seller selection
  - Real-time validation with error messages
  - Radix Dialog for modal presentation

- **AdminRegistrationsPage.jsx**: Admin dashboard for approvals
  - CRUD operations: View, Approve, Reject, Delete
  - Filter by status: All, Pending, Approved, Rejected
  - Detailed view modal for each registration
  - Color-coded status badges

## Features

### Registration Form
**Required Fields for All Users:**
- Business Name
- Contact Person Name
- License Number
- GST Number
- Email Address
- Phone Number (10 digits)
- Complete Address
- City, State, Pincode

**Additional Fields for Sellers:**
- Drug License Number
- Manufacturing License Number

### OTP Verification
- 6-digit OTP generation
- 5-minute expiry window
- Phone number validation (10 digits)
- Demo mode: OTP displayed in console

### Admin Approval System
- View all registrations in card layout
- Filter by status (pending/approved/rejected)
- Approve/Reject with reason
- Delete registrations
- Detailed view modal
- Real-time status updates

## Technology Stack
- **React**: UI framework
- **Radix UI**: Accessible component primitives (Dialog, Tabs)
- **LocalStorage**: Data persistence (demo mode)
- **MVC Pattern**: Clean separation of concerns
- **CSS Modules**: Scoped styling

## Usage

### For Users
1. Click "Sign up now" on login page
2. Select user type (Buyer/Seller)
3. Enter phone number and verify OTP
4. Fill business details form
5. Submit for admin approval

### For Admins
1. Login as admin
2. Navigate to "Registrations" in sidebar
3. Review pending registrations
4. Approve or reject with reason
5. View detailed information in modal

## API Methods

### RegistrationController
```javascript
// OTP Operations
RegistrationController.sendOTP(phone)
RegistrationController.verifyOTP(phone, otp)

// CRUD Operations
RegistrationController.createRegistration(data)
RegistrationController.getAllRegistrations()
RegistrationController.getRegistrationById(id)
RegistrationController.updateRegistration(id, updates)
RegistrationController.deleteRegistration(id)

// Approval Operations
RegistrationController.approveRegistration(id)
RegistrationController.rejectRegistration(id, reason)
```

## File Structure
```
src/
├── models/
│   └── RegistrationModel.js          # Data structure & validation
├── controllers/
│   └── RegistrationController.js     # Business logic & CRUD
├── views/
│   ├── RegistrationForm.jsx          # User registration form
│   └── AdminRegistrationsPage.jsx    # Admin approval dashboard
└── styles/
    ├── registration.css              # Registration form styles
    └── admin-registrations.css       # Admin page styles
```

## Routes
- `/login` - Login page with registration button
- `/admin/registrations` - Admin approval dashboard

## Demo Credentials
- **Admin**: admin@test.com / password
- **OTP**: Check browser console for generated OTP

## Future Enhancements
- SMS gateway integration for real-time OTP
- Email notifications on approval/rejection
- Document upload for licenses
- Backend API integration
- Database persistence
- Multi-factor authentication
