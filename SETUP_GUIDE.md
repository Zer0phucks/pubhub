# PubHub Backend Setup Guide

This guide will walk you through setting up the backend infrastructure for PubHub using Supabase, Vercel, and Inngest.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier is fine to start)
- Git installed

## Quick Start

### Option 1: Automated Setup (Recommended)

Run the setup script:

```bash
./scripts/setup.sh
```

This will guide you through:
1. Installing Supabase CLI if needed
2. Linking to an existing Supabase project or creating a new one
3. Applying the database schema
4. Installing dependencies

### Option 2: Manual Setup

Follow these steps if you prefer manual configuration:

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Set Up Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Create a new project (or use an existing one)
3. Wait for the project to be created (this takes a few minutes)
4. Go to Project Settings > API
5. Copy your Project URL and anon/public key

#### 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Get your service role key from Supabase dashboard (Project Settings > API > service_role key):
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

#### 4. Apply Database Schema

**Option A: Using Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Open `supabase/schema.sql` in a text editor
4. Copy the entire contents
5. Paste into the SQL Editor and run

**Option B: Using Supabase CLI**
1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link to your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Apply the schema:
   ```bash
   supabase db push
   ```

#### 5. Set Up Storage Buckets

1. Go to your Supabase project dashboard
2. Navigate to Storage
3. Create two buckets:
   - `post-media` (private)
   - `user-avatars` (public)

4. Apply storage policies (see `supabase/schema.sql` for policy SQL)

## Platform API Setup (Optional)

To enable social media integrations, you'll need to set up OAuth apps for each platform:

### Twitter/X
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app
3. Set up OAuth 2.0
4. Add credentials to `.env.local`

### Instagram & Facebook
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Instagram Basic Display and Facebook Login products
4. Configure OAuth redirect URIs
5. Add credentials to `.env.local`

### YouTube
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials
5. Add credentials to `.env.local`

### LinkedIn
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create a new app
3. Add Sign In with LinkedIn product
4. Add credentials to `.env.local`

### TikTok
1. Go to [TikTok for Developers](https://developers.tiktok.com/)
2. Create a new app
3. Apply for Login Kit access
4. Add credentials to `.env.local`

### Other Platforms
See individual platform documentation for OAuth setup.

## Inngest Setup (For Background Jobs)

1. Go to [https://www.inngest.com/](https://www.inngest.com/)
2. Sign up for a free account
3. Create a new app
4. Copy your event key and signing key
5. Add to `.env.local`:
   ```
   INNGEST_EVENT_KEY=your-event-key
   INNGEST_SIGNING_KEY=your-signing-key
   ```

## Running the Application

### Development Mode

```bash
npm run dev
```

This will start the Vite dev server at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Deploying to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard:
   - Go to your project settings
   - Add all environment variables from `.env.local`
   - Make sure to add both `NEXT_PUBLIC_*` and server-side variables

## Database Migrations

When you need to update the database schema:

1. Create a new migration file in `supabase/migrations/`
2. Apply the migration:
   ```bash
   supabase db push
   ```

## Troubleshooting

### "Failed to connect to Supabase"
- Check that your `.env.local` has correct credentials
- Verify your Supabase project is active
- Check that your IP is not blocked by Supabase

### "RLS policy violation"
- Make sure you're authenticated (logged in)
- Check that RLS policies are correctly applied
- Verify the user ID matches the data owner

### "Storage upload failed"
- Check that storage buckets are created
- Verify storage policies are applied
- Check file size limits (default: 50MB)

### "Platform OAuth failed"
- Verify OAuth credentials are correct
- Check redirect URIs match your app URL
- Ensure platform app is in production mode (not dev)

## Next Steps

1. ✅ Backend infrastructure is set up
2. 📝 Start implementing API endpoints (see `BACKEND_INTEGRATION_GUIDE.md`)
3. 🔐 Implement authentication UI
4. 🔌 Add platform OAuth flows
5. 📊 Integrate analytics tracking
6. 🤖 Set up Inngest background jobs

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Inngest Documentation](https://www.inngest.com/docs)
- [Backend Integration Guide](./src/BACKEND_INTEGRATION_GUIDE.md)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Supabase logs in the dashboard
3. Check browser console for errors
4. Review the backend integration guide

---

**Note**: This is a development guide. For production deployments, ensure you:
- Use strong, unique secrets for JWT and API keys
- Enable appropriate CORS settings
- Set up proper monitoring and logging
- Implement rate limiting
- Follow security best practices
