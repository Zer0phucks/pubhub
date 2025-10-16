# PubHub Deployment Checklist

Use this checklist to ensure a smooth deployment to Vercel.

## Pre-Deployment

### 1. Code Preparation
- [ ] All code is committed to a Git repository
- [ ] `.gitignore` file is properly configured
- [ ] No sensitive credentials in the code
- [ ] All dependencies are listed in `package.json`
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] Build succeeds locally (`npm run build`)

### 2. GitHub Repository
- [ ] Create a new GitHub repository
- [ ] Push your code to GitHub
- [ ] Repository is accessible from your account

### 3. Clerk Configuration
- [ ] Clerk account created
- [ ] Application created in Clerk Dashboard
- [ ] Production publishable key obtained
- [ ] Allowed origins will be updated after Vercel deployment

### 4. Supabase Configuration
- [ ] Supabase project created
- [ ] Project ID noted
- [ ] Anon key obtained
- [ ] Service role key obtained (keep secure!)
- [ ] Database URL obtained

### 5. External Services
- [ ] Azure OpenAI account with API access
- [ ] Reddit API application registered
- [ ] All API keys collected and secured

---

## Vercel Deployment

### 1. Import to Vercel
- [ ] Sign in to Vercel
- [ ] Click "New Project"
- [ ] Import your GitHub repository
- [ ] Vercel detects Vite framework automatically

### 2. Configure Environment Variables

Add these in Vercel project settings:

**Frontend Variables:**
- [ ] `VITE_CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key
- [ ] `VITE_SUPABASE_URL` - Your Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
- [ ] `VITE_SUPABASE_PROJECT_ID` - Your Supabase project ID

### 3. Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Note your Vercel deployment URL

---

## Supabase Edge Functions

### 1. Install Supabase CLI
```bash
npm install -g supabase
```
- [ ] Supabase CLI installed

### 2. Login and Link
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_ID
```
- [ ] Logged in to Supabase CLI
- [ ] Project linked

### 3. Set Secrets
```bash
supabase secrets set AZURE_OPENAI_API_KEY=your_key
supabase secrets set AZURE_OPENAI_ENDPOINT=your_endpoint
supabase secrets set REDDIT_CLIENT_ID=your_id
supabase secrets set REDDIT_CLIENT_SECRET=your_secret
```
- [ ] AZURE_OPENAI_API_KEY set
- [ ] AZURE_OPENAI_ENDPOINT set
- [ ] REDDIT_CLIENT_ID set
- [ ] REDDIT_CLIENT_SECRET set

### 4. Deploy Functions
```bash
supabase functions deploy server
```
- [ ] Edge function deployed successfully
- [ ] Function URL working

---

## Post-Deployment Configuration

### 1. Update Clerk Allowed Origins
In Clerk Dashboard → API Keys:
- [ ] Add your Vercel URL: `https://your-app.vercel.app`
- [ ] Add custom domain if applicable
- [ ] Save changes

### 2. Test Authentication
- [ ] Visit deployed app
- [ ] Click "Sign In"
- [ ] Complete sign in flow
- [ ] No "Demo Mode" banner appears
- [ ] User profile loads correctly

### 3. Test Core Features
- [ ] Create a project
- [ ] Add subreddit to monitor
- [ ] View feed
- [ ] Test AI response generation
- [ ] Create a post with AI assistance
- [ ] Update project settings
- [ ] Delete a test project

### 4. Test Different Browsers
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### 5. Test Responsive Design
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (iPad)
- [ ] Mobile (iPhone)

---

## Custom Domain (Optional)

### 1. Add Domain in Vercel
- [ ] Go to project settings → Domains
- [ ] Add your custom domain
- [ ] Configure DNS records as instructed

### 2. Update Clerk
- [ ] Add custom domain to Clerk allowed origins
- [ ] Update publishable key if needed

### 3. Test Custom Domain
- [ ] Domain resolves correctly
- [ ] SSL certificate issued
- [ ] Authentication works on custom domain

---

## Monitoring & Maintenance

### 1. Set Up Monitoring
- [ ] Enable Vercel Analytics
- [ ] Set up error tracking
- [ ] Configure log retention

### 2. Documentation
- [ ] Update README with production URL
- [ ] Document any custom configuration
- [ ] Share access with team members

### 3. Backup
- [ ] Export Supabase database backup
- [ ] Document environment variables
- [ ] Store credentials securely (password manager)

---

## Troubleshooting

### If you see "Demo Mode" banner:
1. Check Clerk publishable key is correct
2. Verify deployment URL is in Clerk allowed origins
3. Check browser console for specific errors
4. Review Clerk Dashboard logs

### If backend APIs fail:
1. Verify Supabase edge function is deployed
2. Check edge function logs: `supabase functions logs server`
3. Verify all secrets are set correctly
4. Test edge function directly

### If build fails:
1. Run `npm run build` locally
2. Check for TypeScript errors
3. Review Vercel build logs
4. Verify all dependencies are in `package.json`

---

## Security Checklist

- [ ] All API keys stored as environment variables
- [ ] Service role key never exposed to frontend
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Security headers configured (in `vercel.json`)
- [ ] CORS configured correctly in edge functions
- [ ] Rate limiting considered for API endpoints
- [ ] Regular dependency updates scheduled

---

## Success Criteria

Your deployment is successful when:

✅ App loads without errors
✅ Users can sign in/sign up
✅ Projects can be created and managed
✅ Subreddits can be monitored
✅ Feed displays Reddit content
✅ AI responses generate correctly
✅ Posts can be created
✅ Settings save properly
✅ No "Demo Mode" banner visible
✅ Responsive design works on all devices
✅ No console errors

---

## Next Steps After Deployment

1. **Monitor Performance**
   - Watch Vercel analytics
   - Monitor edge function logs
   - Track user feedback

2. **Iterate and Improve**
   - Gather user feedback
   - Fix bugs as reported
   - Add requested features

3. **Scale**
   - Monitor usage limits
   - Upgrade Vercel plan if needed
   - Optimize database queries
   - Consider caching strategies

---

**Need Help?** Refer to:
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Detailed deployment guide
- [CLERK_SETUP.md](./CLERK_SETUP.md) - Clerk configuration
- [REDDIT_INTEGRATION.md](./REDDIT_INTEGRATION.md) - Reddit API setup
- [CURRENT_STATUS.md](./CURRENT_STATUS.md) - Current status and known issues

**Happy Deploying! 🚀**
