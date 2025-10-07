# Authentication Testing Guide

## Prerequisites

### 1. Environment Configuration
Verify `.env.local` contains valid Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
APP_URL=http://localhost:3000
```

### 2. Supabase Google OAuth Setup
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Add OAuth credentials from Google Cloud Console:
   - Client ID
   - Client Secret
4. Add authorized redirect URL: `https://your-project.supabase.co/auth/v1/callback`
5. Add authorized JavaScript origins: `http://localhost:3000`

### 3. Server Status
Verify both servers are running:
- Backend: http://localhost:3001 (Hono API server)
- Frontend: http://localhost:3000 (Vite React app)

## Test Cases

### Test 1: Email/Password Signup
**Steps:**
1. Navigate to http://localhost:3000
2. Click "Sign up" link
3. Enter:
   - Display Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
   - Confirm Password: "password123"
4. Click "Sign up" button

**Expected Results:**
- ✅ Loading state shows "Creating account..."
- ✅ API request to `POST http://localhost:3001/api/auth/signup`
- ✅ User created in Supabase auth.users table
- ✅ Profile created in user_profiles table
- ✅ Session stored in localStorage
- ✅ Redirected to main app dashboard
- ✅ User info displayed in header

**Failure Scenarios:**
- ❌ Password < 6 chars → Error: "Password must be at least 6 characters"
- ❌ Passwords don't match → Error: "Passwords do not match"
- ❌ Email already exists → Error: "User already registered"

### Test 2: Email/Password Login
**Steps:**
1. Clear localStorage or logout if logged in
2. Navigate to http://localhost:3000
3. Enter:
   - Email: "test@example.com"
   - Password: "password123"
4. Click "Sign in" button

**Expected Results:**
- ✅ Loading state shows "Signing in..."
- ✅ API request to `POST http://localhost:3001/api/auth/login`
- ✅ Session retrieved from Supabase
- ✅ Session stored in localStorage
- ✅ Redirected to main app
- ✅ User authenticated state persists

**Failure Scenarios:**
- ❌ Wrong password → Error: "Invalid login credentials"
- ❌ User doesn't exist → Error: "Invalid login credentials"

### Test 3: Google OAuth Signup (New User)
**Steps:**
1. Navigate to http://localhost:3000
2. Click "Sign up" link
3. Click "Continue with Google" button
4. Select/login with Google account not previously used
5. Authorize PubHub application

**Expected Results:**
- ✅ Redirect to Google OAuth consent screen
- ✅ After authorization, redirect to `/auth/callback?code=...`
- ✅ AuthCallback component shows "Completing sign-in..."
- ✅ API exchanges code for session
- ✅ User created in auth.users table
- ✅ Profile auto-created with Google data (name, email, avatar)
- ✅ Session stored in localStorage
- ✅ Redirect to main app
- ✅ Avatar displayed from Google profile

**Failure Scenarios:**
- ❌ User cancels OAuth → Redirected to login with error message
- ❌ Invalid code → Error: "Failed to complete authentication"

### Test 4: Google OAuth Login (Existing User)
**Steps:**
1. Logout from app
2. Navigate to http://localhost:3000
3. Click "Continue with Google" button
4. Select same Google account from Test 3

**Expected Results:**
- ✅ Redirect to Google (may auto-approve if still authorized)
- ✅ Redirect to `/auth/callback?code=...`
- ✅ Session retrieved for existing user
- ✅ No duplicate profile created
- ✅ Redirect to main app
- ✅ Previous user data intact

### Test 5: Session Persistence
**Steps:**
1. Login using any method (email or Google)
2. Verify logged in to main app
3. Refresh browser page (F5)

**Expected Results:**
- ✅ Brief loading state
- ✅ AuthProvider reads session from localStorage
- ✅ User remains authenticated
- ✅ Main app renders without re-login

**Failure Scenarios:**
- ❌ localStorage cleared → Redirected to login

### Test 6: Logout
**Steps:**
1. Login using any method
2. Click logout button (in header/sidebar)

**Expected Results:**
- ✅ API request to `POST http://localhost:3001/api/auth/logout`
- ✅ Session cleared from localStorage
- ✅ Supabase session terminated
- ✅ Redirect to login page
- ✅ Clicking back button doesn't access protected content

### Test 7: Password Validation
**Steps:**
1. On signup form, try various password combinations:
   - "abc" (too short)
   - "password123" (confirm: "password456") (mismatch)
   - "password123" (confirm: "password123") (valid)

**Expected Results:**
- ✅ "abc" → Error before API call: "Password must be at least 6 characters"
- ✅ Mismatch → Error before API call: "Passwords do not match"
- ✅ Valid → Proceeds to API call

### Test 8: OAuth Error Handling
**Steps:**
1. Manually navigate to `/auth/callback?error=access_denied`

**Expected Results:**
- ✅ Error message displayed: "Authentication failed. Please try again."
- ✅ "Redirecting..." text shown
- ✅ After 3 seconds, redirect to home (login page)

### Test 9: OAuth Missing Code
**Steps:**
1. Manually navigate to `/auth/callback` (no code parameter)

**Expected Results:**
- ✅ Error message: "No authorization code received"
- ✅ Redirect to home after 3 seconds

### Test 10: Cross-Tab Session
**Steps:**
1. Login in Tab 1
2. Open Tab 2 to http://localhost:3000
3. Logout in Tab 1
4. Refresh Tab 2

**Expected Results:**
- ✅ Tab 2 initially shows authenticated (localStorage shared)
- ✅ After logout in Tab 1 and refresh in Tab 2, should prompt for login (session invalidated)

## Debugging Tools

### Browser DevTools
1. **Network Tab**: Monitor API calls to `/api/auth/*`
2. **Console Tab**: Check for errors or auth state logs
3. **Application → Local Storage**: Verify session data structure
4. **Network → Preserve Log**: Track redirects during OAuth flow

### Expected localStorage Structure
```json
{
  "session": {
    "access_token": "eyJ...",
    "refresh_token": "...",
    "expires_at": 1234567890,
    "user": {
      "id": "uuid-here",
      "email": "test@example.com"
    }
  }
}
```

### API Response Examples

**Successful Login:**
```json
{
  "user": {
    "id": "uuid",
    "email": "test@example.com"
  },
  "session": {
    "access_token": "...",
    "refresh_token": "..."
  }
}
```

**Error Response:**
```json
{
  "error": "Invalid login credentials"
}
```

## Database Verification

### Check User Created
```sql
-- Run in Supabase SQL Editor
SELECT id, email, created_at
FROM auth.users
WHERE email = 'test@example.com';
```

### Check Profile Created
```sql
SELECT id, display_name, email, avatar_url, created_at
FROM user_profiles
WHERE email = 'test@example.com';
```

### Verify OAuth User
```sql
-- Check Google OAuth metadata
SELECT id, email, raw_user_meta_data
FROM auth.users
WHERE email = 'your-google-email@gmail.com';
```

## Common Issues

### Issue 1: CORS Error
**Symptom:** Network errors in browser console
**Solution:** Verify backend has CORS enabled for http://localhost:3000

### Issue 2: Google OAuth Redirect Mismatch
**Symptom:** "redirect_uri_mismatch" error from Google
**Solution:**
1. Check Google Cloud Console authorized redirect URIs
2. Verify Supabase callback URL matches

### Issue 3: Session Not Persisting
**Symptom:** User logged out on refresh
**Solution:**
1. Check localStorage for session data
2. Verify AuthProvider reads from localStorage
3. Check browser privacy settings (localStorage enabled)

### Issue 4: User Profile Not Created
**Symptom:** User in auth.users but not in user_profiles
**Solution:**
1. Check backend logs for profile creation errors
2. Verify database permissions (RLS policies)
3. Manually create profile if needed

### Issue 5: "Missing Supabase environment variables"
**Symptom:** Backend server crashes on startup
**Solution:**
1. Verify `.env.local` exists
2. Check all required variables are set
3. Restart backend server after changes

## Test Checklist

- [ ] Email/password signup with valid data
- [ ] Email/password signup with invalid data (short password, mismatch)
- [ ] Email/password login with valid credentials
- [ ] Email/password login with invalid credentials
- [ ] Google OAuth signup (new user)
- [ ] Google OAuth login (existing user)
- [ ] Session persists on page refresh
- [ ] Logout clears session and redirects
- [ ] OAuth error handling (access_denied)
- [ ] OAuth missing code error handling
- [ ] Profile auto-created for Google users
- [ ] Avatar displayed from Google profile

## Next Steps After Testing

Once all tests pass:
1. ✅ Mark authentication as complete
2. 🚀 Move to Phase 1 next task: Platform Connections (Twitter/LinkedIn OAuth)
3. 📝 Document any issues or improvements needed
