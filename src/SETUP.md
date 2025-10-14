# PubHub Setup Guide

## 🎉 Status: ALL SYSTEMS OPERATIONAL!

✅ **Clerk Authentication** - Configured and working  
✅ **Azure OpenAI (GPT-4-mini)** - Configured and working  
✅ **Reddit API** - Configured and working  

**→ See [STATUS.md](./STATUS.md) for complete overview**  
**→ See [AZURE_OPENAI_SETUP.md](./AZURE_OPENAI_SETUP.md) for AI details**  
**→ See [REDDIT_INTEGRATION.md](./REDDIT_INTEGRATION.md) for Reddit details**

---

## Overview
PubHub is a Reddit engagement platform that helps app developers connect with their customers on Reddit using AI-powered responses.

## Authentication

PubHub uses **Clerk** for authentication, providing secure and user-friendly sign-up and sign-in flows with support for email/password, social login, and more.

## Environment Variables Required

You need to configure the following secrets in the Supabase environment:

### 1. Clerk Authentication
- **CLERK_SECRET_KEY**: Your Clerk secret key
  - Get this from your Clerk Dashboard at https://dashboard.clerk.com
  - Navigate to "API Keys" section
  - Copy the "Secret Key" (starts with `sk_test_` or `sk_live_`)
  
**Note:** The Clerk Publishable Key is already embedded in the app. For production use, you would set this as an environment variable.

### 2. Azure OpenAI Configuration
- **AZURE_OPENAI_API_KEY**: Your Azure OpenAI API key
- **AZURE_OPENAI_ENDPOINT**: Your Azure OpenAI endpoint URL
  - Format: `https://YOUR-RESOURCE-NAME.openai.azure.com/openai/deployments/YOUR-DEPLOYMENT-NAME/chat/completions?api-version=2024-02-15-preview`
  - Replace `YOUR-RESOURCE-NAME` with your Azure OpenAI resource name
  - Replace `YOUR-DEPLOYMENT-NAME` with your GPT-4 deployment name (e.g., "gpt-5-mini")

### 3. Reddit API Configuration ✅ CONFIGURED
Your Reddit API credentials have been set up! The integration is ready to use.

**What Reddit Integration Provides:**
- ✅ Subreddit validation (checks if subreddits exist before adding)
- ✅ Historical scanning (30 days for Basic, 90 days for Pro)
- ✅ Real-time monitoring of new posts and comments
- ✅ Intelligent relevance scoring based on your project keywords
- ✅ Automatic feed item creation for engagement opportunities

**How to create your own Reddit app** (if you need new credentials):
1. Go to https://www.reddit.com/prefs/apps
2. Click "Create App" or "Create Another App"
3. Fill in the details:
   - **Name**: PubHub (or your preferred name)
   - **App type**: Select "script"
   - **Description**: Optional
   - **About URL**: Optional
   - **Redirect URI**: http://localhost (required but not used)
4. Click "Create app"
5. Copy the values:
   - **REDDIT_CLIENT_ID**: The string under "personal use script"
   - **REDDIT_CLIENT_SECRET**: The "secret" value

**For detailed Reddit integration documentation, see REDDIT_INTEGRATION.md**

## Features by Tier

### Free Tier
- 1 project
- Monitor up to 3 subreddits
- No historical scanning
- AI-generated responses
- Post creation with AI assistance

### Basic Tier
- 5 projects
- Monitor up to 10 subreddits
- 30-day historical scanning
- All Free tier features

### Pro Tier
- Unlimited projects
- Unlimited subreddits
- 90-day historical scanning
- All Basic tier features

## Clerk Setup Instructions

1. **Create a Clerk Application**:
   - Go to https://clerk.com and sign up/sign in
   - Create a new application
   - Choose "Email" as an authentication method (you can add social providers later)

2. **Get Your API Keys**:
   - In your Clerk Dashboard, go to "API Keys"
   - Copy your "Publishable Key" (already configured in the app)
   - Copy your "Secret Key" and add it to the Supabase environment as `CLERK_SECRET_KEY`

3. **Optional - Configure Social Login**:
   - In Clerk Dashboard, go to "User & Authentication" → "Social Connections"
   - Enable providers like Google, GitHub, etc.
   - Users will automatically see these options in the sign-in flow

## Getting Started

1. **Sign Up**: Create an account using Clerk's authentication (email/password or social login)
2. **Create Project**: Describe your app and let AI suggest relevant subreddits
3. **Select Subreddits**: Choose which subreddits to monitor based on your tier
4. **Monitor Feed**: View relevant posts and comments from your monitored subreddits
5. **AI Responses**: Generate, edit, and send AI-powered responses
6. **Create Posts**: Use AI to create engaging posts for your selected subreddits

## Notes

- This is a demo/prototype application built with Figma Make
- Reddit posting is simulated (not actually posting to Reddit in this demo)
- Historical scanning is limited by Reddit API rate limits
- For production use, additional security measures and Reddit OAuth would be required
