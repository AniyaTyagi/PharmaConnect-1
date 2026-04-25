# Security Fixes Installation Guide

## Backend Setup

### 1. Install Required Dependencies
```bash
cd PharmaConnect-backend
npm install express-rate-limit cookie-parser
```

### 2. Update Environment Variables
Add to `src/.env`:
```env
# CORS Configuration (comma-separated origins)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174

# For production, update to:
# ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Node Environment
NODE_ENV=development
```

### 3. Restart Backend Server
```bash
npm run dev
```

## Frontend Setup

### 1. No Additional Dependencies Required
All changes use existing packages.

### 2. Restart Frontend Server
```bash
cd PharmaConnect-frontend
npm run dev
```

## Testing the Fixes

### 1. JWT in httpOnly Cookies
- Open DevTools → Application → Cookies
- After login, you should see `accessToken` and `refreshToken` cookies
- These cookies have `HttpOnly` flag (not accessible via JavaScript)
- localStorage should only contain user data (no tokens)

### 2. Rate Limiting
- Try logging in with wrong credentials 6 times
- 6th attempt should return: "Too many login attempts, please try again after 15 minutes"

### 3. Token Refresh
- Login and wait 15 minutes (or modify token expiry to 1 minute for testing)
- Make any API call - it should auto-refresh and succeed
- No manual re-login required

### 4. Dynamic Role Verification
- Admin changes a user's role in database
- User's next API call will use the new role (no need to re-login)

### 5. Environment-Based CORS
- Check backend console on startup
- CORS should use origins from ALLOWED_ORIGINS env variable

## Production Deployment Checklist

- [ ] Set `NODE_ENV=production` in backend .env
- [ ] Update `ALLOWED_ORIGINS` with production domain(s)
- [ ] Ensure HTTPS is enabled (required for secure cookies)
- [ ] Test rate limiting in production
- [ ] Monitor token refresh logs
- [ ] Verify cookies are set with `Secure` flag in production

## Rollback Plan

If issues occur, you can temporarily revert by:
1. Restoring the old auth.js, axiosInstance.js, and authRoutes.js files
2. Removing rate limiting middleware
3. Switching back to localStorage tokens (not recommended for production)

## Security Improvements Summary

| Issue | Before | After |
|-------|--------|-------|
| JWT Storage | localStorage (XSS vulnerable) | httpOnly cookies (XSS protected) |
| Token Expiry | 7 days, silent failure | 15min access + 7d refresh, auto-refresh |
| Role Changes | Cached in JWT until expiry | Fetched from DB on each request |
| Brute Force | No protection | 5 attempts per 15 minutes |
| CORS Config | Hardcoded | Environment-based |
