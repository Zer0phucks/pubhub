# PubHub Developer Guide

Complete guide to getting started with PubHub development.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Architecture Overview](#architecture-overview)
- [Key Concepts](#key-concepts)
- [Common Tasks](#common-tasks)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

**Required Software**:
- Node.js v18+ and npm v9+
- Git
- Code editor (VS Code recommended)
- Supabase CLI (`npm install -g supabase`)

**Required Accounts**:
- [Clerk](https://clerk.com) - Authentication
- [Supabase](https://supabase.com) - Backend & Edge Functions
- [Reddit](https://www.reddit.com/prefs/apps) - OAuth API
- [Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service) - AI text generation
- [OpenRouter](https://openrouter.ai/) - AI model routing (Perplexity)
- [Inngest](https://www.inngest.com/) - Background job processing

---

## Quick Start

### 1. Clone and Install

```bash
# Clone repository
git clone https://github.com/yourusername/pubhub.git
cd pubhub

# Install frontend dependencies
npm install

# Project ID for Supabase
PROJECT_ID=vcdfzxjlahsajulpxzsn
```

### 2. Environment Setup

Create `.env.local` in project root:

```bash
# Supabase
VITE_SUPABASE_URL=https://vcdfzxjlahsajulpxzsn.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk Auth
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxx

# For Edge Functions (set via supabase secrets)
CLERK_SECRET_KEY=sk_live_xxx
REDDIT_CLIENT_ID=xxx
REDDIT_CLIENT_SECRET=xxx
AZURE_OPENAI_API_KEY=xxx
AZURE_OPENAI_ENDPOINT=https://xxx.openai.azure.com/
OPEN_ROUTER_API_KEY=xxx
INNGEST_EVENT_KEY=evt_xxx
SECURITY_MODE=dev
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 3. Start Development

```bash
# Start frontend dev server
npm run dev
# → http://localhost:3000

# In another terminal, watch Edge Function logs
# Go to: https://supabase.com/dashboard/project/vcdfzxjlahsajulpxzsn/functions
# Click "make-server-dc1f2437" → "Logs"
```

### 4. Test Login

1. Open http://localhost:3000
2. Click "Sign In"
3. Use test credentials:
   - Email: `claude@test.com`
   - Password: `1Bunfartedoneye`
4. Create a project and scan subreddits

---

## Project Structure

```
pubhub/
├── src/                          # Frontend source
│   ├── components/              # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── Feed.tsx            # Main feed view
│   │   ├── FeedItem.tsx        # Reddit post/comment card
│   │   ├── ProjectSettings.tsx # Project configuration
│   │   ├── CreateProjectModal.tsx
│   │   └── ...
│   ├── pages/                   # Page components
│   │   ├── LandingPage.tsx     # Public landing
│   │   ├── PricingPage.tsx     # Pricing tiers
│   │   └── DocsPage.tsx        # Documentation
│   ├── lib/                     # Utilities
│   │   ├── api.ts              # API client
│   │   └── utils.ts            # Helper functions
│   ├── test/                    # Test utilities
│   │   ├── setup.ts            # Vitest setup
│   │   └── mocks.ts            # Test mocks
│   ├── App.tsx                  # Root component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
│
├── supabase/functions/          # Backend Edge Functions
│   └── make-server-dc1f2437/   # Main Edge Function
│       ├── index.ts            # API endpoints (Hono)
│       ├── reddit.tsx          # Reddit API integration
│       ├── openai.tsx          # Azure OpenAI integration
│       ├── openrouter.tsx      # OpenRouter integration
│       ├── kv_store.tsx        # Supabase KV wrapper
│       ├── jwt.ts              # JWT verification
│       ├── inngest.ts          # Inngest client
│       ├── inngest-functions.ts # Background jobs
│       └── __tests__/          # Backend tests
│
├── docs/                        # Documentation (NEW!)
│   ├── API_REFERENCE.md        # API endpoints
│   ├── COMPONENTS.md           # React components
│   ├── DEVELOPER_GUIDE.md      # This file
│   ├── QUICKSTART.md           # Quick start guide
│   ├── SETUP.md                # Setup instructions
│   ├── DEPLOYMENT.md           # Deployment guide
│   └── ...                     # Other docs
│
├── build/                       # Production build output
├── node_modules/                # Dependencies
├── .env.local                   # Local environment variables
├── package.json                 # Project dependencies
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript configuration
└── README.md                    # Project overview
```

---

## Development Workflow

### Daily Development

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
npm install

# 3. Start dev server
npm run dev

# 4. Make changes
# - Edit files in src/
# - Changes hot-reload automatically
# - Check browser console for errors

# 5. Test changes
npm run test            # Run tests in watch mode
npm run test:run        # Run tests once

# 6. Lint and format
npm run lint            # Check for issues
npm run format          # Auto-format code

# 7. Commit changes
git add .
git commit -m "feat: Add feature description"
git push origin feature-branch
```

### Backend Development

```bash
# Deploy Edge Function
supabase functions deploy make-server-dc1f2437 \
  --project-ref vcdfzxjlahsajulpxzsn \
  --no-verify-jwt

# Set environment variable
supabase secrets set VARIABLE_NAME=value \
  --project-ref vcdfzxjlahsajulpxzsn

# View real-time logs
# Go to Supabase Dashboard → Functions → Logs
```

### Working with Inngest

```bash
# 1. Inngest Dashboard
# https://app.inngest.com/

# 2. After deploying Edge Function, register endpoint:
# Dashboard → Apps → pubhub → Add Serve Handler
# URL: https://vcdfzxjlahsajulpxzsn.supabase.co/functions/v1/make-server-dc1f2437/inngest

# 3. Monitor background jobs
# Dashboard → Functions → Runs
```

---

## Architecture Overview

### Technology Stack

**Frontend**:
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui for UI components
- Clerk for authentication

**Backend**:
- Supabase Edge Functions (Deno runtime)
- Hono web framework
- Supabase KV for data storage
- Inngest for background jobs

**External APIs**:
- Reddit OAuth API (user authentication + data fetching)
- Azure OpenAI gpt-5-mini (AI responses)
- OpenRouter + Perplexity Sonar (subreddit suggestions)

### Data Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. User action
       ▼
┌─────────────┐
│  React App  │
└──────┬──────┘
       │ 2. API request (Clerk JWT)
       ▼
┌──────────────────┐
│  Edge Function   │ ← 3. Verify JWT
│  (Hono API)      │
└──────┬───────────┘
       │
       ├─ 4a. Store/retrieve data → Supabase KV
       ├─ 4b. Background job → Inngest
       ├─ 4c. Reddit data → Reddit API
       └─ 4d. AI generation → Azure OpenAI
```

### Authentication Flow

```
1. User signs in with Clerk
2. Clerk issues JWT token
3. Frontend stores JWT in memory
4. API requests include JWT in Authorization header
5. Backend verifies JWT (strict mode) or decodes (dev mode)
6. Backend returns user-specific data
```

### Scanning Flow

```
1. User clicks "Scan Now"
2. Frontend → POST /scan-history
3. Backend triggers Inngest event: reddit/scan.requested
4. Inngest background job:
   a. Fetch Reddit posts (parallel)
   b. Calculate relevance scores
   c. Save to KV store
5. Frontend polls /feed/:projectId
6. New items appear in feed
```

---

## Key Concepts

### Projects

A **project** represents an app/product the user wants to promote on Reddit.

**Key Properties**:
- `name`: Display name
- `description`: What the app does (used for keyword extraction)
- `subreddits`: Target subreddits to monitor
- `keywords`: AI-generated keywords for relevance scoring
- `persona`: AI persona for response generation

**Tier Limits**:
- Free: 1 project
- Basic: 5 projects
- Pro: Unlimited

### Feed Items

A **feed item** is a Reddit post or comment that's relevant to a project.

**Properties**:
- `type`: 'post' or 'comment'
- `relevance_score`: Keyword match score (0-100+)
- `ai_response`: Generated response (nullable)
- `status`: 'pending' | 'approved' | 'posted' | 'ignored'

**Relevance Scoring**:
- 10 points per keyword match
- Word boundary matching (`\bkeyword\b`)
- Case-insensitive

### Background Jobs (Inngest)

**Key Functions**:

1. **scanRedditSubreddits** - On-demand scanning
   - Event: `reddit/scan.requested`
   - Rate limit: 10/hour per user
   - Parallel subreddit processing

2. **redditMonitorSubreddits** - Scheduled monitoring
   - Cron: Every 15 minutes
   - Auto-scans active projects
   - Discovers new posts

3. **generateAIResponse** - AI response generation
   - Event: `ai/response.generate`
   - Rate limit: 50/hour per user

4. **generateProjectKeywords** - Keyword extraction
   - Event: `project/keywords.generate`
   - Uses Perplexity AI

---

## Common Tasks

### Adding a New API Endpoint

1. **Define route in `index.ts`**:
```typescript
app.post('/make-server-dc1f2437/my-endpoint', async (c) => {
  const user = await getAuthUser(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const { data } = await c.req.json();

  // Your logic here

  return c.json({ result: 'success' });
});
```

2. **Add client method in `api.ts`**:
```typescript
export const api = {
  // ...existing methods
  myEndpoint: (data: any) =>
    apiRequest('/my-endpoint', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
```

3. **Deploy**:
```bash
supabase functions deploy make-server-dc1f2437 \
  --project-ref vcdfzxjlahsajulpxzsn \
  --no-verify-jwt
```

4. **Test**:
```typescript
const result = await api.myEndpoint({ test: true });
console.log(result);
```

---

### Creating a New Component

1. **Create component file**:
```bash
touch src/components/MyComponent.tsx
```

2. **Define component**:
```typescript
// src/components/MyComponent.tsx
import { useState } from 'react';

interface MyComponentProps {
  data: string;
  onAction: () => void;
}

export function MyComponent({ data, onAction }: MyComponentProps) {
  const [state, setState] = useState('initial');

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold">{data}</h2>
      <button
        onClick={onAction}
        className="mt-2 px-4 py-2 bg-teal-600 text-white rounded"
      >
        Action
      </button>
    </div>
  );
}
```

3. **Write tests**:
```typescript
// src/components/__tests__/MyComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders with data', () => {
    render(<MyComponent data="Test" onAction={() => {}} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('calls onAction when button clicked', () => {
    const onAction = vi.fn();
    render(<MyComponent data="Test" onAction={onAction} />);

    fireEvent.click(screen.getByText('Action'));
    expect(onAction).toHaveBeenCalled();
  });
});
```

4. **Use in app**:
```typescript
import { MyComponent } from './components/MyComponent';

<MyComponent data="Hello" onAction={handleAction} />
```

---

### Adding an Inngest Background Function

1. **Define function in `inngest-functions.ts`**:
```typescript
export const myBackgroundJob = inngest.createFunction(
  {
    id: 'my-background-job',
    name: 'My Background Job',
    retries: 2,
  },
  { event: 'my/job.trigger' },
  async ({ event, step }) => {
    const { data } = event.data;

    await step.run('process-data', async () => {
      // Your background logic here
      console.log('Processing:', data);
      return { processed: true };
    });

    return { success: true };
  }
);

// Add to functions array
export const functions = [
  scanRedditSubreddits,
  myBackgroundJob, // Add here
  // ...
];
```

2. **Trigger from API**:
```typescript
app.post('/make-server-dc1f2437/trigger-job', async (c) => {
  await inngest.send({
    name: 'my/job.trigger',
    data: { data: 'test' }
  });

  return c.json({ status: 'job started' });
});
```

3. **Monitor in Inngest Dashboard**:
```
https://app.inngest.com/ → Functions → my-background-job
```

---

### Debugging

#### Frontend Debugging

**Browser DevTools**:
```javascript
// src/components/Feed.tsx
console.log('==================== SCAN NOW ====================');
console.log('Project ID:', projectId);
console.log('Subreddits:', subreddits);
console.log('Current items:', items.length);
```

**React DevTools**:
- Install React DevTools extension
- Inspect component props and state
- Profile component renders

#### Backend Debugging

**Supabase Function Logs**:
```
https://supabase.com/dashboard/project/vcdfzxjlahsajulpxzsn/functions
→ Click "make-server-dc1f2437"
→ Click "Logs" tab
→ Filter by level (info/error)
```

**Local Testing**:
```bash
# Test Edge Function locally
supabase functions serve make-server-dc1f2437 --no-verify-jwt

# Make request
curl http://localhost:54321/functions/v1/make-server-dc1f2437/health
```

**Inngest Debugging**:
```
https://app.inngest.com/ → Functions → [function name] → Runs
→ Click failed run → View error details
```

---

## Testing

### Unit Tests

```bash
# Run tests in watch mode
npm run test

# Run tests once (CI mode)
npm run test:run

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui
```

### Test Structure

```typescript
// Example: api.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api } from '../api';

describe('API Client', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  it('makes authenticated request', async () => {
    const result = await api.getUserProfile();
    expect(result).toHaveProperty('email');
  });

  it('handles errors gracefully', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    await expect(api.getUserProfile()).rejects.toThrow('Network error');
  });
});
```

### Integration Testing

```bash
# Test full user flows
npm run test:integration
```

### E2E Testing

```bash
# Using Playwright (future)
npm run test:e2e
```

---

## Deployment

### Frontend (Vercel)

```bash
# Automatic deployment via GitHub
git push origin main
# → Deploys to production

# Manual deployment
npm run build
vercel --prod
```

**Environment Variables** (Vercel Dashboard):
```
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxx
VITE_SUPABASE_URL=https://vcdfzxjlahsajulpxzsn.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

### Backend (Supabase Edge Functions)

```bash
# Deploy Edge Function
supabase functions deploy make-server-dc1f2437 \
  --project-ref vcdfzxjlahsajulpxzsn \
  --no-verify-jwt

# Set production secrets
supabase secrets set SECURITY_MODE=strict \
  --project-ref vcdfzxjlahsajulpxzsn

supabase secrets set ALLOWED_ORIGINS="https://pubhub.dev,https://www.pubhub.dev" \
  --project-ref vcdfzxjlahsajulpxzsn
```

### Deployment Checklist

- [ ] Run tests: `npm run test:run`
- [ ] Build frontend: `npm run build`
- [ ] Deploy Edge Function
- [ ] Set SECURITY_MODE=strict
- [ ] Set ALLOWED_ORIGINS to production domains
- [ ] Verify Inngest endpoint registered
- [ ] Test authentication flow
- [ ] Test Reddit scanning
- [ ] Check Supabase function logs
- [ ] Monitor Inngest background jobs

---

## Troubleshooting

### Common Issues

#### "Authentication failed" errors

**Cause**: JWT verification failing in strict mode

**Solution**:
1. Check CLERK_SECRET_KEY is set correctly
2. Verify token is not expired
3. Try dev mode: `SECURITY_MODE=dev`

```bash
supabase secrets set SECURITY_MODE=dev \
  --project-ref vcdfzxjlahsajulpxzsn
```

---

#### Reddit scanning returns no results

**Cause**: Keywords not matching or date range too narrow

**Solution**:
1. Check project keywords in Settings
2. Verify subreddit has recent posts
3. Check scan date range (Free tier = 1 day)
4. Review backend logs for relevance scores

---

#### Inngest functions not running

**Cause**: Endpoint not registered or event key incorrect

**Solution**:
1. Check Inngest Dashboard → Apps → pubhub → Serve Handlers
2. Verify INNGEST_EVENT_KEY is set
3. Re-register endpoint if needed:
   ```
   URL: https://vcdfzxjlahsajulpxzsn.supabase.co/functions/v1/make-server-dc1f2437/inngest
   ```

---

#### CORS errors in browser

**Cause**: Origin not in ALLOWED_ORIGINS

**Solution**:
```bash
supabase secrets set ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173" \
  --project-ref vcdfzxjlahsajulpxzsn
```

---

#### Build errors

**Cause**: TypeScript errors or missing dependencies

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript
npm run type-check

# Build
npm run build
```

---

## Additional Resources

### Documentation
- [API Reference](./API_REFERENCE.md) - Complete API endpoint documentation
- [Component Documentation](./COMPONENTS.md) - React component details
- [Quick Start](./QUICKSTART.md) - Get started in 5 minutes
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment

### External Docs
- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Inngest Documentation](https://www.inngest.com/docs)
- [Hono Framework](https://hono.dev/)
- [Reddit API](https://www.reddit.com/dev/api)

### Community
- GitHub Issues: [Report bugs](https://github.com/yourusername/pubhub/issues)
- Discord: [Join community](#)
- Email: support@pubhub.dev

---

## Code Style Guide

### TypeScript

```typescript
// Use explicit types
interface User {
  id: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// Use const for immutability
const API_BASE = 'https://api.pubhub.dev';

// Use async/await over promises
async function fetchData() {
  const response = await fetch(url);
  return response.json();
}
```

### React

```typescript
// Functional components with TypeScript
export function MyComponent({ data }: { data: string }) {
  const [state, setState] = useState<string>('');

  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  return <div>{data}</div>;
}
```

### CSS (Tailwind)

```typescript
// Use utility classes
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h2 className="text-2xl font-bold text-gray-900">Title</h2>
</div>

// Use dark mode classes
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content
</div>
```

---

## Git Workflow

### Branch Naming

```
feat/description    # New features
fix/description     # Bug fixes
docs/description    # Documentation changes
refactor/description # Code refactoring
test/description    # Test additions
```

### Commit Messages

```
feat: Add Reddit OAuth integration
fix: Resolve scanning timeout issue
docs: Update API reference
refactor: Simplify feed item component
test: Add feed component tests
```

### Pull Request Process

1. Create feature branch: `git checkout -b feat/my-feature`
2. Make changes and commit: `git commit -m "feat: Add feature"`
3. Push to GitHub: `git push origin feat/my-feature`
4. Create pull request on GitHub
5. Wait for review and CI checks
6. Merge when approved

---

**Last Updated**: 2025-10-15
**Maintained By**: PubHub Development Team
**Questions?** Open an issue or contact support@pubhub.dev
