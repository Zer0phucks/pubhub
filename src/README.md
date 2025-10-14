# PubHub

<div align="center">
  <h3>Reddit Engagement Platform for App Developers</h3>
  <p>Connect with your customers where they are - on Reddit</p>
</div>

---

## 🚀 Quick Start

### For Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd pubhub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your configuration values.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### For Vercel Deployment

**See the complete deployment guide:** [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

Quick steps:
1. Push code to GitHub
2. Import to Vercel
3. Configure environment variables
4. Deploy!

---

## 📖 What is PubHub?

PubHub is a Reddit engagement platform designed specifically for app developers to connect with their customers. The platform helps you:

- 🎯 **Monitor relevant subreddits** - Find where your customers are talking
- 🤖 **AI-powered responses** - Get intelligent response suggestions powered by Azure OpenAI
- 📊 **Unified feed** - View all mentions, comments, and posts in one place
- 📝 **Create engaging posts** - Use AI assistance to craft compelling Reddit posts
- ⚙️ **Customizable personas** - Train the AI to match your brand voice

---

## ✨ Features

### Project Management
- Create multiple projects (tier-based limits)
- Describe your app for better AI context
- Get AI-suggested subreddits to monitor

### Reddit Monitoring
- Monitor up to 3 subreddits (free), 10 (basic), or unlimited (pro)
- Historical scanning: 30 days (basic) or 90 days (pro)
- Track DMs, comments, and posts
- Sortable, filterable feed

### AI-Powered Responses
- Auto-generated responses using GPT-4-mini
- Review and approve before posting
- Customizable AI personas
- Context-aware suggestions

### Modern UI
- Beautiful teal, green, and cyan gradients
- Light and dark mode support
- Responsive design
- Smooth animations

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Authentication:** Clerk
- **Backend:** Supabase (Edge Functions, Database, Storage)
- **AI:** Azure OpenAI (GPT-4-mini)
- **APIs:** Reddit API
- **Deployment:** Vercel

---

## 📚 Documentation

- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - Complete deployment guide
- **[CLERK_SETUP.md](./CLERK_SETUP.md)** - Clerk authentication configuration
- **[REDDIT_INTEGRATION.md](./REDDIT_INTEGRATION.md)** - Reddit API setup
- **[AZURE_OPENAI_SETUP.md](./AZURE_OPENAI_SETUP.md)** - Azure OpenAI configuration
- **[CURRENT_STATUS.md](./CURRENT_STATUS.md)** - Implementation status and roadmap

---

## 🔐 Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Clerk (Frontend)
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...

# Supabase (Frontend)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id

# Supabase Edge Functions (Backend - set via Supabase CLI)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_DB_URL=postgresql://...

# Azure OpenAI (Backend - set via Supabase CLI)
AZURE_OPENAI_API_KEY=your_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com

# Reddit API (Backend - set via Supabase CLI)
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
```

---

## 🏗️ Project Structure

```
pubhub/
├── components/          # React components
│   ├── ui/             # Shadcn UI components
│   ├── Feed.tsx        # Main feed view
│   ├── CreatePost.tsx  # Post creation interface
│   └── ...
├── pages/              # Landing and marketing pages
├── lib/                # Utility functions and API client
├── supabase/
│   └── functions/
│       └── server/     # Edge function backend
├── styles/             # Global CSS and Tailwind config
├── utils/              # Helper utilities
└── public/             # Static assets
```

---

## 🚦 Tier Limits

### Free Tier
- 1 project
- 3 monitored subreddits
- No historical scanning
- Basic AI responses

### Basic Tier ($19/month)
- 5 projects
- 10 monitored subreddits
- 30-day historical scanning
- Enhanced AI responses

### Pro Tier ($49/month)
- Unlimited projects
- Unlimited monitored subreddits
- 90-day historical scanning
- Advanced AI features

---

## 🤝 Contributing

This is a private project. For questions or issues, please contact the development team.

---

## 📄 License

Proprietary - All rights reserved

---

## 🆘 Support

For technical support:
1. Check the documentation files in this repository
2. Review error logs in Vercel and Supabase dashboards
3. Contact the development team

---

## 🔄 Current Status

The application is fully functional with:
- ✅ Complete Clerk authentication integration
- ✅ Reddit API integration with full monitoring
- ✅ Azure OpenAI integration for AI responses
- ✅ Comprehensive project and subreddit management
- ✅ Beautiful, responsive UI with dark mode
- ✅ Ready for production deployment

**Demo Mode Note:** The app currently uses demo mode for authentication when the domain doesn't match Clerk configuration. When deployed to the production domain (`pubhub.dev`), full authentication will work seamlessly.

---

Built with ❤️ for app developers
