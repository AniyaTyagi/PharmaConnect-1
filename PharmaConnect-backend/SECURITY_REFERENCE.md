# Security Architecture Quick Reference

## Authentication Flow

### Login
```
1. User submits credentials → POST /api/auth/login
2. Backend validates (rate limited: 5 attempts/15min)
3. Backend generates:
   - accessToken (15min) → httpOnly cookie
   - refreshToken (7d) → httpOnly cookie
4. Frontend stores user data in localStorage (UI only)
5. User redirected to dashboard
```

### Protected API Calls
```
1. Frontend makes request with credentials: true
2. Browser automatically sends cookies
3. Backend middleware:
   - Extracts accessToken from cookie
   - Verifies JWT signature
   - Fetches fresh user data from DB (including current role)
   - Attaches user to req.user
4. Route handler processes request
```

### Token Refresh (Automatic)
```
1. API call fails with 401 (token expired)
2. Axios interceptor catches error
3. Calls POST /api/auth/refresh with refreshToken cookie
4. Backend validates refreshToken
5. Backend issues new accessToken → httpOnly cookie
6. Original request retried automatically
7. User never sees error
```

### Logout
```
1. User clicks logout
2. Frontend calls POST /api/auth/logout
3. Backend clears both cookies
4. Frontend clears localStorage
5. User redirected to login
```

## Key Files Modified

### Backend
- `src/app.js` - Added cookie-parser middleware
- `src/routes/authRoutes.js` - Rate limiting, cookies, refresh endpoint
- `src/middleware/authMiddleware.js` - Cookie support, DB role fetch
- `src/utils/generateToken.js` - Access/refresh token types

### Frontend
- `src/utils/auth.js` - Removed token functions (cookies only)
- `src/utils/axiosInstance.js` - Added withCredentials, auto-refresh
- `src/services/api.js` - Added logout API call
- `src/pages/login.jsx` - Removed saveToken calls
- `src/components/Topbar.jsx` - Updated logout to call API
- `src/admin/components/AdminHeader.jsx` - Updated logout
- `src/seller/components/SellerHeader.jsx` - Updated logout

## Environment Variables

### Backend (.env)
```env
# Required
JWT_SECRET=your-secret-key
MONGO_URI=mongodb://...

# Security (new)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
NODE_ENV=development

# Production
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

## Cookie Configuration

### Development
```javascript
{
  httpOnly: true,      // Not accessible via JavaScript
  secure: false,       // HTTP allowed (NODE_ENV !== production)
  sameSite: "strict",  // CSRF protection
  maxAge: 900000       // 15 minutes (access) or 7 days (refresh)
}
```

### Production
```javascript
{
  httpOnly: true,
  secure: true,        // HTTPS required
  sameSite: "strict",
  maxAge: 900000
}
```

## Rate Limiting

### Login Endpoint
- **Limit**: 5 attempts per IP
- **Window**: 15 minutes
- **Response**: 429 Too Many Requests
- **Message**: "Too many login attempts, please try again after 15 minutes"

### Adding Rate Limiting to Other Endpoints
```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests" }
});

router.post("/endpoint", limiter, handler);
```

## Testing Commands

### Test Rate Limiting
```bash
# Run 6 times quickly
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"wrong@test.com","password":"wrong"}'
done
```

### Test Token Refresh
```bash
# 1. Login and save cookies
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@test.com","password":"password"}' \
  -c cookies.txt

# 2. Wait 15 minutes (or modify token expiry)

# 3. Make protected call (should auto-refresh)
curl http://localhost:5000/api/auth/me \
  -b cookies.txt
```

### Verify Cookies
```bash
# Check cookie attributes
curl -v http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@test.com","password":"password"}' \
  2>&1 | grep -i "set-cookie"
```

## Common Issues & Solutions

### Issue: "No token provided" on API calls
**Solution**: Ensure `withCredentials: true` in axios config

### Issue: CORS error with credentials
**Solution**: Backend must set `credentials: true` in CORS config

### Issue: Cookies not being sent
**Solution**: 
- Check same-origin policy
- Verify VITE_API_URL matches backend URL
- In production, ensure HTTPS

### Issue: Token refresh loop
**Solution**: Check refreshToken is not expired (7 days)

### Issue: Role changes not reflecting
**Solution**: Verify authMiddleware fetches user from DB, not just JWT

## Security Best Practices

✅ **DO**
- Use HTTPS in production
- Set strong JWT_SECRET (64+ characters)
- Monitor rate limit logs
- Rotate JWT_SECRET periodically
- Use environment variables for all secrets

❌ **DON'T**
- Store tokens in localStorage
- Disable httpOnly flag
- Use same secret for dev and production
- Commit .env files to git
- Ignore rate limit alerts
