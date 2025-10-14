# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Login Credentials**
Use these credentials for authenticating pubhub.dev
email : "claude@test.com"
password : "1Bunfartedoneye"
## Project Overview

PubHub is a Reddit engagement platform that helps developers find and respond to relevant discussions about their apps/products. It uses AI to scan subreddits, identify relevant posts, and generate contextual responses.



**Tech Stack:**
- Frontend: React + Vite + Tailwind CSS + shadcn/ui components
- Backend: Supabase Edge Functions (Deno/Hono)
- Auth: Clerk
- Database: Supabase KV Store (key-value storage)
- AI: Azure OpenAI (gpt-5-mini), OpenRouter (Perplexity Sonar)
- External APIs: Reddit OAuth API

**Project ID:** `vcdfzxjlahsajulpxzsn`

## Development Commands

### Frontend
```bash
npm run dev          # Start Vite dev server (runs on http://localhost:3000)
npm run build        # Build for production (outputs to build/)
npm run test         # Run Vitest tests in watch mode
npm run test:ui      # Run Vitest with UI
npm run test:run     # Run tests once (CI mode)
npm run test:coverage # Run tests with coverage report
```

### Backend (Supabase Edge Functions)
```bash
# Deploy Edge Function (always use --no-verify-jwt flag)
supabase functions deploy make-server-dc1f2437 --project-ref vcdfzxjlahsajulpxzsn --no-verify-jwt

# View logs in real-time
# Go to: https://supabase.com/dashboard/project/vcdfzxjlahsajulpxzsn/functions
# Click on "make-server-dc1f2437" → "Logs" tab

# Set secret environment variable
supabase secrets set VARIABLE_NAME=value --project-ref vcdfzxjlahsajulpxzsn
```

## Architecture

### Frontend Structure

**Main App Flow:**
1. `App.tsx` - Root component with Clerk authentication wrapper
   - `<SignedOut>` → Shows public landing page (`PublicSite` component)
   - `<SignedIn>` → Shows authenticated app (`AppContent` component)
2. `AppContent` loads user profile and projects from backend
3. Main views: Feed, Create Post, Project Settings (controlled by `Sidebar` navigation)

**Key Components:**
- `Feed.tsx` - Main feed view with scan functionality and progress tracking
- `ProjectSettings.tsx` - Manage project config, keywords, subreddits, AI persona
- `CreateProjectModal.tsx` - AI-powered project creation with subreddit suggestions
- `FeedItem.tsx` - Individual Reddit post/comment with AI response generation

**API Client:**
- `src/lib/api.ts` - All backend API calls
- Uses dual authentication: Clerk JWT (preferred) or Supabase anon key (fallback)
- Base URL: `https://vcdfzxjlahsajulpxzsn.supabase.co/functions/v1/make-server-dc1f2437`

### Backend Structure

**Single Edge Function:** `supabase/functions/make-server-dc1f2437/`

**Core Files:**
- `index.ts` - Main Hono app with all HTTP endpoints
- `reddit.tsx` - Reddit OAuth API integration (token management, post fetching, keyword matching)
- `openai.tsx` - Azure OpenAI integration for gpt-5-mini
- `openrouter.tsx` - OpenRouter integration for Perplexity Sonar (used for subreddit suggestions)
- `kv_store.tsx` - Supabase KV store wrapper functions

**Authentication Strategy:**
- Uses JWT decoding without signature verification (due to Clerk/Supabase compatibility issues)
- Falls back to demo user when JWT invalid or missing
- All authenticated endpoints call `getAuthUser(request)` helper

**Data Storage (KV Store Keys):**
```
user:{userId}                    → User profile (tier, theme, email)
project:{userId}:{projectId}     → Project config (name, description, keywords, subreddits, persona)
feed:{projectId}:{itemId}        → Feed items (Reddit posts/comments)
last_scan:{projectId}            → Last scan timestamp for monitor-subreddits
```

### Key Workflows

#### 1. Keyword-Based Scanning

**Keyword Generation (on project creation):**
1. AI extracts 5-10 keywords from project description using OpenRouter/Perplexity
2. Keywords stored in `project.keywords` array
3. Fallback to regex-based extraction if AI fails

**Keyword Extraction Algorithm (`reddit.tsx:extractKeywords`):**
- Removes stop words (a, the, is, etc.)
- Filters words > 3 characters
- Returns unique lowercase terms

**Relevance Scoring (`reddit.tsx:calculateRelevanceScore`):**
- Word boundary regex matching: `\b{keyword}\b`
- 10 points per keyword match
- Example: "productivity" appears 2 times = 20 points

**Scanning Process (`index.ts:scan-history` endpoint):**
1. Fetch 100 posts from each subreddit via `/r/{subreddit}/new`
2. Filter by date range (Free: 1 day, Basic: 30 days, Pro: 90 days)
3. Score each post with keywords
4. Save posts with score > 0 to KV feed store
5. Also scan comments on highly relevant posts (score > 20)

#### 2. Scan Now Feature

**Frontend (`Feed.tsx:handleScanNow`):**
- Shows progress bar with simulated progress (3 seconds per subreddit estimate)
- Cycles through subreddit names during scan
- Displays estimated time remaining
- Comprehensive console logging for debugging

**Backend (`index.ts:scan-history`):**
- Extensive logging: keywords used, posts fetched, date filtering, relevance scores
- First 5 posts within date range show detailed debug info including matched keywords
- Returns: `{ scanned, newItems, items, debug: { totalScanned, withinDateRange, matchedPosts } }`

#### 3. AI-Powered Features

**Subreddit Suggestions (`index.ts:suggest-subreddits`):**
- Uses OpenRouter with Perplexity Sonar model
- Analyzes app description + URL
- Returns 8-10 relevant, active subreddits
- JSON parsing with markdown code block handling

**Response Generation (`index.ts:generate-response`):**
- Uses Azure OpenAI gpt-5-mini
- Customizable persona per project
- Generates contextual responses < 200 words

**Post Generation (`index.ts:generate-post`):**
- Creates Reddit posts for specific subreddits
- Uses project persona and description
- Supports "enhance" mode for user-written posts

### Important Constraints & Gotchas

**Azure OpenAI gpt-5-mini Limitations:**
- ONLY supports `max_completion_tokens` (not `max_tokens`)
- ONLY supports default temperature (1) - no customization
- Do NOT use: `temperature`, `top_p`, `frequency_penalty`, `presence_penalty`

**Reddit API:**
- OAuth2 client credentials flow
- Token cached for ~1 hour with 1-minute buffer
- User-Agent required: `PubHub/1.0 (by /u/PubHubApp)`
- Rate limits: Handle 429 responses gracefully

**Supabase Edge Functions:**
- Always deploy with `--no-verify-jwt` flag
- Environment variables must be set via `supabase secrets set`
- Deno runtime (not Node.js) - use `Deno.env.get()`

**Frontend Environment Variables:**
- Vite requires `VITE_` prefix for client-side variables
- Backend variables (no prefix) are only available in Edge Functions

**Keyword Matching:**
- Currently uses simple word boundary regex
- Case-insensitive matching
- No fuzzy matching or stemming
- May need adjustment if too strict/loose

### Logging Standards

**Frontend Logging:**
- Use boxed console sections: `==================== TITLE ====================`
- Log before API calls (request data) and after (response data)
- Include project/user context in scan operations

**Backend Logging:**
- Module prefix: `[Reddit][function]`, `[AI][function]`, etc.
- Include requestId for tracking
- Log duration for external API calls
- Preview long strings (max 100-200 chars) with ellipsis

**Debug Logging:**
- `console.debug()` for detailed traces
- `console.log()` for important events
- `console.error()` for failures with full error stack

### Testing & Debugging

**View Supabase Function Logs:**
```
https://supabase.com/dashboard/project/vcdfzxjlahsajulpxzsn/functions
→ Click "make-server-dc1f2437"
→ Click "Logs" tab
→ Watch real-time output during scans
```

**Common Debug Steps:**
1. Check browser console for frontend errors
2. Check Supabase function logs for backend errors
3. Verify keywords are generated (check logs or Project Settings)
4. Verify date range (cutoff date in logs)
5. Check keyword match scores in first 5 posts

**Test User Flow:**
1. Create project → Check if keywords auto-generated
2. Add subreddits in settings
3. Click "Scan Now" in Feed
4. Watch progress bar and logs
5. Check if feed items appear

### Environment Variables

**Required for Development:**
```
# Supabase
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Clerk Auth
VITE_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY

# Reddit API
REDDIT_CLIENT_ID
REDDIT_CLIENT_SECRET

# AI (choose one or both)
AZURE_OPENAI_API_KEY
AZURE_OPENAI_ENDPOINT
OPEN_ROUTER_API_KEY
```

See `.env.local` for complete list with current values.
