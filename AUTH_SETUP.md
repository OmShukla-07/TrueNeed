# TrueNeed Authentication Setup Guide

This guide explains how to set up the forgot password and OAuth login features in TrueNeed.

## Features Implemented

1. **Forgot Password** - Users can reset their password via email
2. **OAuth Login** - Users can sign in with Google, Apple, or Microsoft

---

## Table of Contents

1. [Forgot Password Setup](#forgot-password-setup)
2. [Google OAuth Setup](#google-oauth-setup)
3. [Microsoft OAuth Setup](#microsoft-oauth-setup)
4. [Apple OAuth Setup](#apple-oauth-setup)
5. [Testing](#testing)

---

## Forgot Password Setup

### Email Configuration

For **development**, the system is configured to print password reset emails to the console:

```env
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

For **production**, configure SMTP settings in your `.env` file:

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-gmail-app-password
DEFAULT_FROM_EMAIL=TrueNeed <noreply@trueneed.com>
```

### Gmail App Password Setup

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification**
3. Scroll to **App passwords**
4. Generate a new app password for "Mail"
5. Copy the 16-character password to `EMAIL_HOST_PASSWORD`

### Frontend Integration

The forgot password flow is already integrated:

1. User clicks "Forgot Password?" on login panel
2. Enters their email address
3. Backend sends reset email with token
4. User receives email with reset link (format: `http://localhost:5173/reset-password?token=xxx&uid=yyy`)
5. Frontend needs a `/reset-password` route to handle the token and allow password change

**TODO**: Create a password reset page at `/reset-password` that:
- Reads `token` and `uid` from URL params
- Shows a form with new password fields
- Calls `authAPI.resetPassword(token, newPassword)` on submit

---

## Google OAuth Setup

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. Configure:
   - **Name**: TrueNeed Web Client
   - **Authorized JavaScript origins**: 
     - `http://localhost:8000`
     - `http://localhost:5173`
   - **Authorized redirect URIs**:
     - `http://localhost:8000/api/auth/oauth/google/callback/`

7. Copy the **Client ID** and **Client Secret**

### 2. Configure Environment Variables

Add to your `backend/.env`:

```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

### 3. How It Works

1. User clicks "Continue with Google"
2. Frontend calls `authAPI.oauthLogin('google')`
3. Backend returns Google authorization URL
4. Browser redirects to Google login
5. User authorizes the app
6. Google redirects back to `/api/auth/oauth/google/callback/`
7. Backend exchanges code for access token
8. Backend fetches user info from Google
9. Backend creates/finds user and returns JWT tokens
10. User is logged in

---

## Microsoft OAuth Setup

### 1. Create Microsoft Azure App

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Configure:
   - **Name**: TrueNeed
   - **Supported account types**: Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI**: Web → `http://localhost:8000/api/auth/oauth/microsoft/callback/`

5. Click **Register**
6. Copy the **Application (client) ID**
7. Navigate to **Certificates & secrets**
8. Create a **New client secret**
9. Copy the secret **Value** (not the Secret ID)

### 2. Configure API Permissions

1. Navigate to **API permissions**
2. Add permissions:
   - Microsoft Graph → Delegated → `openid`
   - Microsoft Graph → Delegated → `email`
   - Microsoft Graph → Delegated → `profile`
3. Grant admin consent

### 3. Configure Environment Variables

Add to your `backend/.env`:

```env
MICROSOFT_CLIENT_ID=your-application-id-here
MICROSOFT_CLIENT_SECRET=your-client-secret-here
MICROSOFT_TENANT=common
```

---

## Apple OAuth Setup

### 1. Create Apple Service ID

1. Go to [Apple Developer](https://developer.apple.com/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **+** button
4. Select **Services IDs** → Continue
5. Configure:
   - **Description**: TrueNeed
   - **Identifier**: com.trueneed.web (reverse domain notation)
6. Enable **Sign In with Apple**
7. Configure domains and return URLs:
   - **Domains**: `localhost`
   - **Return URLs**: `http://localhost:8000/api/auth/oauth/apple/callback/`

### 2. Create Private Key

1. Go to **Keys** → **+** button
2. Enable **Sign In with Apple**
3. Download the `.p8` private key file
4. Note the **Key ID**

### 3. Get Team ID

1. Go to [Apple Developer Account](https://developer.apple.com/account/)
2. Find your **Team ID** in the top right

### 4. Configure Environment Variables

Add to your `backend/.env`:

```env
APPLE_CLIENT_ID=com.trueneed.web
APPLE_CLIENT_SECRET=your-client-secret-here
APPLE_KEY_ID=your-key-id-here
APPLE_TEAM_ID=your-team-id-here
```

**Note**: Apple OAuth implementation requires additional JWT signing with the private key. This is marked as `NotImplementedError` in the code and needs further development.

---

## Testing

### Test Forgot Password

1. Start backend: `cd backend && python manage.py runserver`
2. Start frontend: `npm run dev`
3. Click login → "Forgot Password?"
4. Enter registered email
5. Check console for password reset email (development mode)
6. Copy the reset link and test (need to create reset password page)

### Test Google OAuth

1. Configure Google OAuth credentials (see above)
2. Click "Continue with Google" on login/signup
3. Authorize the app in Google's popup
4. Should return to app logged in

### Test Microsoft OAuth

1. Configure Microsoft Azure app (see above)
2. Click "Continue with Microsoft"
3. Sign in with Microsoft account
4. Should return to app logged in

---

## Production Deployment Checklist

- [ ] Set `DEBUG=False` in production
- [ ] Use strong `SECRET_KEY`
- [ ] Configure production database (PostgreSQL)
- [ ] Set up real SMTP for emails (not console backend)
- [ ] Update `ALLOWED_HOSTS` with production domain
- [ ] Update `FRONTEND_URL` with production URL
- [ ] Update OAuth redirect URIs to production URLs
- [ ] Enable HTTPS for all OAuth callbacks
- [ ] Set `SESSION_COOKIE_SECURE=True`
- [ ] Configure CORS for production domain

---

## API Endpoints

### Forgot Password
```
POST /api/auth/forgot-password/
Body: { "email": "user@example.com" }
Response: { "message": "Password reset email sent successfully" }
```

### Reset Password
```
POST /api/auth/reset-password/
Body: { 
  "token": "reset-token", 
  "uid": "user-id-base64",
  "password": "NewPassword123!",
  "password2": "NewPassword123!"
}
Response: { "message": "Password reset successfully" }
```

### OAuth Login
```
GET /api/auth/oauth/<provider>/
Response: { "auth_url": "https://..." }
```

### OAuth Callback
```
POST /api/auth/oauth/<provider>/callback/
Body: { "code": "auth-code", "state": "csrf-token" }
Response: { 
  "user": {...}, 
  "tokens": { "access": "...", "refresh": "..." }
}
```

---

## Troubleshooting

### "Invalid redirect URI" error
- Make sure redirect URIs in OAuth provider match exactly
- Include `http://` or `https://`
- Don't forget trailing slash: `/callback/`

### Email not sending
- Check SMTP credentials
- Verify EMAIL_HOST_USER has app password configured
- Check firewall/antivirus blocking port 587
- For Gmail, enable "Less secure app access"

### OAuth "Invalid state" error
- Backend session not persisting properly
- Make sure `SESSION_COOKIE_SAMESITE='Lax'` in settings
- Check `CORS_ALLOW_CREDENTIALS=True`

### "User already exists" on OAuth
- This is normal - OAuth will log in existing users
- Users created via OAuth can't use password login (no password set)
- Consider adding ability to "link" accounts

---

## Next Steps

1. Create frontend `/reset-password` page
2. Add password strength indicator
3. Implement Apple OAuth JWT signing
4. Add OAuth account linking
5. Add social profile picture import
6. Implement "remember me" functionality
7. Add brute-force protection for login attempts

---

For questions or issues, refer to:
- Django Email Docs: https://docs.djangoproject.com/en/5.0/topics/email/
- Google OAuth Docs: https://developers.google.com/identity/protocols/oauth2
- Microsoft OAuth Docs: https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow
- Apple Sign In Docs: https://developer.apple.com/sign-in-with-apple/
