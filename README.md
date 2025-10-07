# PubHub - Multi-Platform Content Creator Dashboard

A powerful, modern dashboard for content creators to manage, schedule, and publish content across multiple social media platforms from one unified interface.

## 🚀 Features

- **Multi-Platform Support**: Manage content for Twitter, Instagram, Facebook, YouTube, LinkedIn, TikTok, Pinterest, Reddit, and custom blogs
- **Content Composer**: Create and schedule posts with platform-specific optimizations
- **Unified Inbox**: View and respond to comments and messages from all platforms in one place
- **Content Calendar**: Visual calendar for scheduling and managing your content pipeline
- **Analytics Dashboard**: Track performance metrics across all your connected platforms
- **Media Library**: Import and transform videos from YouTube and TikTok
- **Automation Rules**: Create rules to automatically transform and cross-post content
- **AI Assistant**: Get content suggestions and platform-specific advice
- **Template Library**: Save and reuse content templates

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS v4, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Hosting**: Vercel
- **Background Jobs**: Inngest
- **Charts**: Recharts
- **State Management**: React Hooks

## 📦 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- A Supabase account (free tier works)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd pubhub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up backend** (Automated)
   ```bash
   ./scripts/setup.sh
   ```

   Or follow the [Manual Setup Guide](./SETUP_GUIDE.md)

4. **Configure environment variables**
   - Copy `.env.example` to `.env.local`
   - Add your Supabase credentials
   - Optionally add platform API keys for integrations

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:5173](http://localhost:5173)

## 📚 Documentation

- [Backend Integration Guide](./src/BACKEND_INTEGRATION_GUIDE.md) - Comprehensive backend architecture and API documentation
- [Setup Guide](./SETUP_GUIDE.md) - Detailed setup instructions
- [AI Chat Feature](./AI_CHAT_FEATURE.md) - AI assistant implementation details

## 🔐 Environment Variables

Key environment variables needed:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Platform APIs (Optional - for OAuth integrations)
TWITTER_CLIENT_ID=
INSTAGRAM_CLIENT_ID=
YOUTUBE_CLIENT_ID=
# ... etc

# AI Features (Optional)
OPENAI_API_KEY=
```

See `.env.example` for complete list.

## 🏗️ Project Structure

```
pubhub/
├── src/
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── calendar/    # Calendar view components
│   │   └── ...          # Feature components
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   │   └── supabase/    # Supabase client and helpers
│   └── supabase/        # Supabase functions
│       └── functions/   # Edge functions
├── supabase/
│   └── schema.sql       # Database schema
├── scripts/
│   └── setup.sh         # Setup automation script
└── public/              # Static assets
```

## 🚢 Deployment

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Configure Environment Variables**
   - Add all variables from `.env.local` to Vercel dashboard
   - Set production URLs appropriately

### Database Setup

The database schema is automatically applied during setup. For manual application:

```bash
# Using Supabase CLI
supabase db push

# Or copy supabase/schema.sql to Supabase SQL Editor
```

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Adding New Features

1. Follow the existing component structure
2. Use TypeScript for type safety
3. Follow the established patterns in existing code
4. Update relevant documentation

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- UI design inspired by modern content creator tools
- Built with [shadcn/ui](https://ui.shadcn.com/) components
- Powered by [Supabase](https://supabase.com/)
- Original Figma design: https://www.figma.com/design/kPALXFlckKnp3360kKGaE4/Creator-Dashboard-Design

## 📞 Support

For issues or questions:
- Check the [Setup Guide](./SETUP_GUIDE.md)
- Review [Backend Integration Guide](./src/BACKEND_INTEGRATION_GUIDE.md)
- Check Supabase logs for backend errors
- Review browser console for frontend errors

---

**Note**: This application requires a Supabase backend to function. Make sure to complete the backend setup before starting development.