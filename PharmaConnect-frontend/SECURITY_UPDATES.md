# Frontend Security Updates

## What Changed

### 1. Token Storage (XSS Protection)
**Before**: JWT stored in localStorage
```javascript
localStorage.setItem("token", token); // ❌ Vulnerable to XSS
```

**After**: JWT in httpOnly cookies (managed by backend)
```javascript
// ✅ Tokens automatically sent with requests
// No JavaScript access = No XSS risk
```

### 2. Axios Configuration
**Before**: Manual token attachment
```javascript
config.headers.Authorization = `Bearer ${token}`;
```

**After**: Automatic cookie handling
```javascript
axios.create({
  withCredentials: true  // ✅ Sends cookies automatically
});
```

### 3. Token Refresh (Seamless UX)
**Before**: 401 → Logout → Manual re-login
```javascript
if (err.response?.status === 401) {
  logout();
  redirect("/login");
}
```

**After**: 401 → Auto-refresh → Retry → Success
```javascript
// Interceptor automatically:
// 1. Catches 401
// 2. Calls /api/auth/refresh
// 3. Retries original request
// 4. User never sees error
```

### 4. Logout Process
**Before**: Clear localStorage only
```javascript
localStorage.removeItem("token");
localStorage.removeItem("user");
```

**After**: API call to clear cookies
```javascript
await fetch("/api/auth/logout", {
  method: "POST",
  credentials: "include"
});
localStorage.removeItem("user");
```

## Files Modified

### Core Authentication
- `src/utils/auth.js` - Removed token functions
- `src/utils/axiosInstance.js` - Added auto-refresh logic
- `src/services/api.js` - Added logout endpoint

### Login Flow
- `src/pages/login.jsx` - Removed saveToken calls

### Logout Components
- `src/components/Topbar.jsx` - Buyer logout
- `src/admin/components/AdminHeader.jsx` - Admin logout
- `src/seller/components/SellerHeader.jsx` - Seller logout

## Developer Guide

### Making API Calls
No changes needed! Existing code works as-is:
```javascript
import axiosInstance from "../utils/axiosInstance";

// Cookies sent automatically
const response = await axiosInstance.get("/api/orders/my");
```

### Checking Authentication
```javascript
import { isAuthenticated, getUserRole } from "../utils/auth";

if (isAuthenticated()) {
  // User is logged in
}

const role = getUserRole(); // "buyer", "seller", "admin"
```

### Handling Logout
```javascript
import { api } from "../services/api";
import { logout } from "../utils/auth";

const handleLogout = async () => {
  await api.logout(); // Clears cookies on backend
  logout();           // Clears localStorage
  navigate("/login");
};
```

## Testing Checklist

### ✅ Login Flow
1. Open DevTools → Application → Cookies
2. Login with any account
3. Verify `accessToken` and `refreshToken` cookies exist
4. Verify `HttpOnly` flag is set
5. Verify localStorage has NO tokens (only user data)

### ✅ Token Refresh
1. Login and navigate to any page
2. Wait 15 minutes (or modify backend token expiry to 1 min)
3. Click any action that makes an API call
4. Should work seamlessly (no logout)
5. Check Network tab - should see `/api/auth/refresh` call

### ✅ Logout
1. Login to any account
2. Click logout button
3. Check cookies are cleared
4. Check localStorage is cleared
5. Verify redirect to login page

### ✅ Rate Limiting
1. Enter wrong credentials 5 times
2. 6th attempt should show: "Too many login attempts, please try again after 15 minutes"

## Browser Compatibility

### Cookies with Credentials
All modern browsers support `credentials: "include"`:
- ✅ Chrome 51+
- ✅ Firefox 52+
- ✅ Safari 10+
- ✅ Edge 79+

### SameSite Cookies
`sameSite: "strict"` supported in:
- ✅ Chrome 51+
- ✅ Firefox 60+
- ✅ Safari 12+
- ✅ Edge 16+

## Common Issues

### Issue: "No token provided" error
**Cause**: `withCredentials` not set
**Fix**: Already fixed in `axiosInstance.js`

### Issue: Cookies not visible in DevTools
**Cause**: httpOnly flag (this is correct!)
**Fix**: No fix needed - this is the security feature

### Issue: CORS error after login
**Cause**: Backend CORS not configured for credentials
**Fix**: Already fixed in backend `app.js`

### Issue: Logout doesn't clear cookies
**Cause**: Not calling `/api/auth/logout`
**Fix**: Already fixed in all header components

## Migration Notes

### For Existing Code
If you have custom API calls using the old pattern:
```javascript
// ❌ Old pattern (remove this)
const token = localStorage.getItem("token");
fetch("/api/endpoint", {
  headers: { Authorization: `Bearer ${token}` }
});

// ✅ New pattern (use this)
import axiosInstance from "../utils/axiosInstance";
axiosInstance.get("/api/endpoint");
```

### For Protected Routes
No changes needed! `ProtectedRoute` component still works:
```javascript
// Still works as-is
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

## Security Benefits

| Feature | Security Benefit |
|---------|-----------------|
| httpOnly Cookies | Prevents XSS token theft |
| Auto Token Refresh | Reduces attack window (15min vs 7 days) |
| Rate Limiting | Prevents brute force attacks |
| Dynamic Role Check | Immediate permission updates |
| Secure Flag (prod) | Prevents MITM attacks |
| SameSite Strict | Prevents CSRF attacks |

## Production Deployment

### Environment Variables
Update `.env`:
```env
VITE_API_URL=https://api.yourdomain.com
```

### HTTPS Requirement
Cookies with `Secure` flag require HTTPS:
- ✅ Development: HTTP allowed (secure: false)
- ✅ Production: HTTPS required (secure: true)

### Verify Deployment
1. Check cookies have `Secure` flag in production
2. Verify CORS allows your production domain
3. Test login/logout flow
4. Test token refresh after 15 minutes
5. Verify rate limiting works

## Support

For issues or questions:
1. Check `SECURITY_REFERENCE.md` in backend
2. Review `INSTALLATION_GUIDE.md` in backend
3. Test with browser DevTools Network tab
4. Check backend logs for errors
