# PubHub - Vercel Deployment Guide

This guide will help you deploy PubHub to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. A GitHub account
3. Your PubHub code in a GitHub repository
4. Clerk account with production keys configured
5. Supabase project with edge functions deployed
6. Azure OpenAI API access
7. Reddit API credentials

## Step 1: Push to GitHub

1. Create a new repository on GitHub
2. Initialize git in your project directory:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/pubhub.git
   git push -u origin main
   ```

## Step 2: Import Project to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your PubHub repository
4. Vercel will auto-detect the framework settings

## Step 3: Configure Environment Variables

In the Vercel project settings, add the following environment variables:

### Frontend Environment Variables (VITE_* prefix)

```
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_key_here
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_PROJECT_ID=your_project_id_here
```

**Important Notes:**
- The Clerk publishable key MUST match your Vercel deployment domain
- Update your Clerk allowed origins in the Clerk Dashboard to include your Vercel domain
- The current key `pk_live_Y2xlcmsucHViaHViLmRldiQ` is configured for `pubhub.dev`

## Step 4: Deploy Supabase Edge Functions

Your Supabase edge functions need to be deployed separately:

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-id
   ```

4. Set secrets for edge functions:
   ```bash
   supabase secrets set AZURE_OPENAI_API_KEY=your_key
   supabase secrets set AZURE_OPENAI_ENDPOINT=your_endpoint
   supabase secrets set REDDIT_CLIENT_ID=your_id
   supabase secrets set REDDIT_CLIENT_SECRET=your_secret
   ```

5. Deploy functions:
   ```bash
   supabase functions deploy server
   ```

## Step 5: Update Clerk Configuration

1. Go to your Clerk Dashboard (https://dashboard.clerk.com)
2. Navigate to your application
3. Go to "API Keys" section
4. Add your Vercel deployment URL to "Allowed Origins"
   - Example: `https://your-app.vercel.app`
5. If using a custom domain, add that as well
6. Ensure you're using production keys for your production domain

## Step 6: Deploy

1. Click "Deploy" in Vercel
2. Wait for the build to complete
3. Your app will be available at `https://your-app.vercel.app`

## Step 7: Verify Deployment

1. Visit your deployed app
2. Test sign in/sign up functionality
3. Create a project
4. Verify Reddit integration works
5. Test AI-generated responses

## Troubleshooting

### Clerk "origin_invalid" errors

- Ensure your Vercel domain is added to Clerk's allowed origins
- Check that you're using the correct publishable key for your domain
- The key in the code is for `pubhub.dev` - update it for your domain

### "Demo Mode" banner appears

- This means Clerk authentication is falling back to demo mode
- Verify your Clerk publishable key matches your deployment domain
- Check browser console for specific Clerk errors

### Backend API errors

- Verify Supabase edge functions are deployed
- Check that all environment variables are set in Supabase
- Review edge function logs: `supabase functions logs server`

### Build failures

- Ensure all dependencies in `package.json` are correct
- Check for TypeScript errors: `npm run type-check`
- Review Vercel build logs for specific errors

## Custom Domain Setup (Optional)

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain (e.g., `pubhub.dev`)
4. Follow Vercel's DNS configuration instructions
5. Update Clerk allowed origins with your custom domain
6. Update the Clerk publishable key if needed

## Environment-Specific Configuration

### Development
- Use Clerk development keys
- Point to development Supabase project
- Use test Reddit credentials

### Production
- Use Clerk production keys
- Point to production Supabase project
- Use production Reddit credentials
- Enable all security headers (already configured in `vercel.json`)

## Monitoring and Logs

- **Vercel Logs**: Check deployment and runtime logs in Vercel Dashboard
- **Supabase Logs**: Monitor edge function logs via Supabase CLI or Dashboard
- **Clerk Logs**: Review authentication events in Clerk Dashboard

## Support

For issues specific to:
- **Deployment**: Check Vercel documentation
- **Authentication**: Review Clerk documentation
- **Backend**: Check Supabase edge functions documentation
- **Application**: Refer to project documentation in `/guidelines/Guidelines.md`

## Important Security Notes

1. Never commit `.env` files with real credentials
2. Rotate API keys regularly
3. Use Vercel's environment variable encryption
4. Enable all recommended security headers (configured in `vercel.json`)
5. Keep SUPABASE_SERVICE_ROLE_KEY secure and never expose it to the frontend

## Post-Deployment Checklist

- [ ] App loads successfully
- [ ] Sign in/sign up works
- [ ] Projects can be created
- [ ] Reddit integration functions
- [ ] AI responses generate correctly
- [ ] All environment variables are set
- [ ] Custom domain configured (if applicable)
- [ ] Clerk domain allowlist updated
- [ ] Monitoring and logging enabled
- [ ] Demo mode banner does not appear

---

**Need Help?** Check the other documentation files:
- `CLERK_SETUP.md` - Detailed Clerk configuration
- `REDDIT_INTEGRATION.md` - Reddit API setup
- `AZURE_OPENAI_SETUP.md` - Azure OpenAI configuration
- `CURRENT_STATUS.md` - Current implementation status
