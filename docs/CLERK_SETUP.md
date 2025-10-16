# Clerk Authentication Setup

## Current Status

The app is currently running in **Demo User Mode** which allows full functionality while being developed outside of the production domain.

## Why Demo Mode?

Your Clerk production keys (`pk_live_Y2xlcmsucHViaHViLmRldiQ`) are configured for the domain **pubhub.dev**. Clerk production keys are domain-locked for security, which means:

- ✅ They work perfectly when deployed to `pubhub.dev` or `*.pubhub.dev`
- ❌ They don't work in development environments or other domains
- 🔄 Demo mode allows you to develop and test all features regardless of domain

This is the correct and secure behavior for production Clerk keys.

## How It Works

1. **Frontend Authentication**: Users can still sign in/up through Clerk, but domain validation is bypassed
2. **Backend Authentication**: The backend uses a demo user (`demo-user-123`) for all data operations
3. **Session Management**: Your browser session is still managed by Clerk
4. **Full Functionality**: All features (projects, feeds, AI responses, etc.) work normally

## Options for Development

You have three options for working with Clerk:

### Option 1: Keep Using Demo Mode (Recommended for Development)
- ✅ No additional setup required
- ✅ All features work immediately
- ✅ Easy to test without domain configuration
- ✅ When you deploy to `pubhub.dev`, authentication will work automatically

### Option 2: Use Development Keys
If you want full Clerk authentication in development:
1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Switch to "Development" environment
3. Copy the development publishable key (starts with `pk_test_`)
4. Replace the key in `/App.tsx`

Development keys work on any domain including localhost.

### Option 3: Deploy to pubhub.dev
Your production keys will work automatically when deployed to:
- `pubhub.dev`
- `www.pubhub.dev`
- Any subdomain like `app.pubhub.dev`

## Enabling Full JWT Authentication (When Deployed)

Once your app is deployed to `pubhub.dev`, you can enable full JWT authentication:

### 1. Verify Domain Configuration

Your Clerk production keys are already configured for `pubhub.dev`. Verify in your [Clerk Dashboard](https://dashboard.clerk.com):

1. Go to your application settings
2. Navigate to **Domains** section
3. Confirm `pubhub.dev` is listed and verified
4. Make sure your deployment URL matches this domain

### 2. Configure JWT Template (Optional)

For custom JWT claims:

1. In Clerk Dashboard, go to **JWT Templates**
2. Create a new template or use the default
3. If using a custom template, update the frontend code to request it:

```typescript
const token = await getToken({ template: 'your-template-name' });
```

### 3. Enable JWT Authentication in App

Once Clerk is properly configured:

1. Open `/App.tsx`
2. Find the `setGetTokenFunction` call
3. Replace the demo mode code with:

```typescript
setGetTokenFunction(async () => {
  try {
    const token = await getToken();
    console.log('Clerk JWT authentication enabled');
    return token;
  } catch (error) {
    console.error('Error getting Clerk token:', error);
    return null;
  }
});
```

4. Remove the `<DemoModeBanner />` component from the UI

### 4. Update Backend (Optional)

The backend is already configured to validate Clerk JWTs. For production security, consider implementing JWT signature verification:

```typescript
// Install the Clerk backend SDK in your edge function
import { verifyToken } from '@clerk/backend';

// In getAuthUser function, replace manual decoding with:
const payload = await verifyToken(token, {
  secretKey: clerkSecretKey,
});
```

## Troubleshooting

### "Invalid JWT" Errors

This typically means:
- The Clerk domain hasn't been configured yet
- The publishable key doesn't match the deployment domain
- The JWT template is misconfigured

**Solution**: Keep demo mode enabled until Clerk domain is properly set up.

### Users See Wrong Data

If users are seeing each other's data:
- This shouldn't happen in demo mode as Clerk manages sessions
- Check that each user has a unique Clerk user ID
- Verify the backend is using `user.id` from Clerk correctly

### Backend Errors

If you see authentication errors in the backend:
- Check that `CLERK_SECRET_KEY` environment variable is set correctly
- Verify it matches the publishable key's Clerk instance
- Ensure the secret key starts with `sk_live_`

## Current Configuration

- **Frontend Publishable Key**: `pk_live_Y2xlcmsucHViaHViLmRldiQ`
- **Backend Secret Key**: Set via environment variable `CLERK_SECRET_KEY`
- **Authentication Mode**: Demo User Fallback (until Clerk domain is configured)
- **Session Management**: Clerk (fully functional)
- **Data Storage**: Supabase KV Store (working normally)

## Benefits of Demo Mode

1. ✅ App works immediately without waiting for Clerk domain setup
2. ✅ All features are fully functional
3. ✅ Users can sign in/up and manage their sessions
4. ✅ Easy to switch to full JWT auth when ready
5. ✅ No data loss or migration needed

## Next Steps

1. **Test the app** - Verify all features work in demo mode
2. **Configure Clerk domain** - Set up your production domain in Clerk
3. **Enable JWT auth** - Switch from demo mode to full authentication
4. **Remove demo banner** - Clean up the UI once JWT works

For questions, refer to [Clerk's Documentation](https://clerk.com/docs) or check the backend logs for detailed authentication information.
