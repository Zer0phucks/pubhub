# Debugging Authentication Issues

## Steps to Debug

1. **Open Browser Console** (F12)

2. **Look for these log messages**:
   ```
   API Request: https://...
   Token type: Clerk JWT (or Supabase Anon Key)
   Token (first 30 chars): ...
   ```

3. **Check which token type is being sent**:
   - If it says "Supabase Anon Key" - Clerk token is not being retrieved
   - If it says "Clerk JWT" - Token is being sent correctly

4. **Check the backend logs in Supabase Dashboard**:
   - Go to Supabase Dashboard → Edge Functions → Logs
   - Look for:
     - "Auth check - Authorization header: Present/Missing"
     - "Token received (first 20 chars): ..."
     - "JWT payload decoded successfully. User ID: ..."
     - "Authentication successful for user: ..."

## Common Issues

### Issue 1: "Token type: Supabase Anon Key"
**Problem**: Clerk token is not being retrieved by `getToken()`

**Solution**:
- Make sure you're signed in with Clerk
- Check if `useAuth` hook is working
- Verify Clerk is properly initialized

### Issue 2: "Invalid JWT format"
**Problem**: Token doesn't have 3 parts (header.payload.signature)

**Solution**:
- The token might be malformed
- Check if Clerk is returning a valid JWT

### Issue 3: "No user ID (sub) in token payload"
**Problem**: JWT doesn't contain a 'sub' claim

**Solution**:
- Clerk JWT should include a 'sub' claim with user ID
- Check Clerk configuration

### Issue 4: Backend returns 401 immediately
**Problem**: Supabase might be validating JWT before it reaches our code

**Solution**:
- This is a Supabase Edge Function limitation
- We may need to use a different auth approach

## Manual Test

You can test the authentication endpoint directly:

1. **Get your Clerk token**:
   Open console and run:
   ```javascript
   const { getToken } = window.Clerk?.session;
   const token = await getToken();
   console.log('Clerk Token:', token);
   ```

2. **Test the auth endpoint**:
   ```bash
   curl -X GET \
     'https://vcdfzxjlahsajulpxzsn.supabase.co/functions/v1/make-server-dc1f2437/auth-test' \
     -H 'Authorization: Bearer YOUR_CLERK_TOKEN_HERE'
   ```

## Temporary Workaround

If authentication keeps failing, we can temporarily allow unauthenticated requests for testing:

1. Comment out the auth check in backend
2. Use a default test user
3. Test the rest of the app functionality
4. Come back to fix auth later

This will help us determine if the issue is with:
- Authentication specifically
- Or the entire backend setup
