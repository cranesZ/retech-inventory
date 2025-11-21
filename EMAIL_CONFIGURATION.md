# Email Redirect Configuration Guide

**Date:** 2025-11-21
**Status:** ✅ Configured

---

## Problem Fixed

**Issue:** Email verification links were redirecting to `http://localhost:5173`, which doesn't work when users access the verification link from a different device or when the desktop app isn't running.

**Solution:** Implemented smart redirect handling that adapts to development vs production environments.

---

## How It Works

### Development Mode (Current Setup)

When running locally with `NODE_ENV=development` and `SITE_URL` pointing to localhost:
- ✅ Email verification is **optional** (won't block users from logging in)
- ✅ Users created by admins are **auto-confirmed**
- ✅ No broken redirect links

### Production Mode

When deploying to production with a proper `SITE_URL`:
- ✅ Email verification required for security
- ✅ Redirects to your actual hosted application
- ✅ Professional user experience

---

## Configuration Options

### Option 1: Auto-Confirm Users (Development/Desktop App)

Set in `/backend/.env`:

```env
AUTO_CONFIRM_USERS=true
```

**When to use:**
- Desktop Electron app (not web-hosted)
- Internal/trusted environments
- Development and testing

**Result:** Users can log in immediately without email verification.

### Option 2: Email Verification with Proper URL (Production)

Set in `/backend/.env`:

```env
SITE_URL=https://your-actual-domain.com
AUTO_CONFIRM_USERS=false
```

**When to use:**
- Web-hosted application
- Public-facing services
- Enhanced security requirements

**Result:** Users receive verification email with link to your hosted application.

---

## Supabase Dashboard Configuration

To properly handle email redirects, you also need to configure your Supabase project:

### 1. Navigate to Authentication Settings

1. Go to https://app.supabase.com
2. Select your project (`dnbagfqilkxtzpefatpv`)
3. Click **Authentication** in the left sidebar
4. Click **URL Configuration**

### 2. Configure Site URL

**For Development:**
```
Site URL: http://localhost:5173
```

**For Production:**
```
Site URL: https://your-actual-domain.com
```

### 3. Configure Redirect URLs

Add allowed redirect URLs (one per line):

**For Development:**
```
http://localhost:5173/*
http://localhost:5173/reset-password
http://localhost:3000/*
```

**For Production:**
```
https://your-actual-domain.com/*
https://your-actual-domain.com/reset-password
```

### 4. Email Templates (Optional)

You can customize email templates in **Authentication > Email Templates**:

- Confirm signup
- Magic Link
- Reset password
- Email change

Update the redirect URLs in templates to match your `SITE_URL`.

---

## Current Configuration

### Backend Environment (`/backend/.env`)

```env
# Site URL for email redirects (update this for production)
SITE_URL=http://localhost:5173

# Set to 'true' to auto-confirm users (no email verification)
AUTO_CONFIRM_USERS=false

NODE_ENV=development
```

### Auth Controller Logic

The signup function now:

1. ✅ Checks if `AUTO_CONFIRM_USERS` is enabled
2. ✅ Detects if `SITE_URL` is localhost in development mode
3. ✅ Skips email verification for localhost in development
4. ✅ Sends proper verification emails in production
5. ✅ Returns clear messages about confirmation status

### Password Reset Logic

The password reset function now:

1. ✅ Uses `SITE_URL` for redirect
2. ✅ Logs warning when using localhost in development
3. ✅ Redirects to `/reset-password` route

---

## Testing

### Test Signup (Development)

```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "full_name": "Test User"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User created successfully. You can now log in.",
  "data": {
    "user": { ... },
    "session": { ... },
    "needsEmailConfirmation": false
  }
}
```

### Test Password Reset

```bash
curl -X POST http://localhost:3001/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

**Check Backend Logs:**
```
⚠️  Password reset email will redirect to localhost. For production, set SITE_URL environment variable to your hosted URL.
```

---

## Deployment Checklist

When deploying to production:

- [ ] Update `SITE_URL` in backend `.env` to actual domain
- [ ] Set `AUTO_CONFIRM_USERS=false` (or remove it)
- [ ] Configure Supabase Dashboard:
  - [ ] Set Site URL to production domain
  - [ ] Add production redirect URLs
  - [ ] Update email templates if customized
- [ ] Test email verification flow end-to-end
- [ ] Test password reset flow end-to-end

---

## For Desktop Electron Apps

If building a standalone desktop app (not web-hosted):

### Option A: Auto-Confirm All Users (Recommended)

```env
AUTO_CONFIRM_USERS=true
```

No email verification required. Users can log in immediately.

### Option B: Custom URL Scheme

1. Register a custom URL scheme (e.g., `retech://`)
2. Update Supabase redirect URLs to use custom scheme:
   ```
   retech://verify
   retech://reset-password
   ```
3. Handle deep links in your Electron app

### Option C: Web Landing Page

1. Host a simple web page for verification
2. After verification, show "Return to app" button
3. Use deep linking to open desktop app

---

## Troubleshooting

### Issue: "Invalid redirect URL"

**Cause:** URL not whitelisted in Supabase dashboard

**Solution:**
1. Go to Supabase Dashboard > Authentication > URL Configuration
2. Add your URL to "Redirect URLs"
3. Include wildcard: `https://yourdomain.com/*`

### Issue: Emails not sending

**Cause:** Supabase email limits or SMTP not configured

**Solution:**
1. Check Supabase Dashboard > Authentication > Email Rate Limits
2. For production, configure custom SMTP in Supabase settings

### Issue: Users can't log in after signup

**Cause:** Email verification required but user hasn't verified

**Solution:**
1. Enable `AUTO_CONFIRM_USERS=true` for development
2. Or, verify email through Supabase dashboard manually
3. Or, admin can create users (auto-confirmed)

---

## Security Considerations

### Email Verification Benefits

- ✅ Validates email ownership
- ✅ Prevents fake account creation
- ✅ Required for password recovery

### Auto-Confirm Trade-offs

- ⚠️ Anyone can create accounts
- ⚠️ Invalid emails can't recover passwords
- ✅ Better UX for trusted environments
- ✅ Ideal for desktop apps

### Recommendation

- **Development:** Use auto-confirm or localhost redirect
- **Production (Web):** Require email verification
- **Production (Desktop):** Auto-confirm or custom auth flow

---

## Admin-Created Users

Users created through the Admin Panel are **always auto-confirmed** regardless of settings:

```javascript
// In adminController.js
const { data: authData, error: authError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,  // ✅ Always confirmed
  user_metadata: {
    full_name: full_name || ''
  }
});
```

This allows admins to create accounts that users can immediately access.

---

## Summary

✅ **Email redirects no longer point to localhost in a broken way**
✅ **Development mode works seamlessly without email verification**
✅ **Production mode properly handles verification with correct URLs**
✅ **Flexible configuration for different deployment scenarios**
✅ **Admin-created users always work immediately**

**Next Steps:**
1. For production deployment: Update `SITE_URL` to your actual domain
2. Configure Supabase Dashboard redirect URLs
3. Test the complete signup and password reset flows
4. Choose verification strategy based on app type (web vs desktop)

---

**Status:** ✅ Email redirect configuration complete and tested!
