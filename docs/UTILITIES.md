# PubHub Utilities Documentation

Documentation for core utility functions and libraries used throughout PubHub.

---

## Table of Contents

- [Frontend Utilities](#frontend-utilities)
- [Backend Utilities](#backend-utilities)
- [API Client](#api-client)
- [Reddit Integration](#reddit-integration)
- [AI Integration](#ai-integration)
- [KV Store](#kv-store)

---

## Frontend Utilities

### src/lib/utils.ts

#### `cn(...inputs: ClassValue[])`

Utility function for conditionally joining Tailwind CSS class names.

**Description**: Combines `clsx` and `tailwind-merge` to merge class names intelligently, handling conflicts and conditional classes.

**Parameters**:
- `inputs` (ClassValue[]): Any number of class names, objects, or arrays

**Returns**: `string` - Merged class names

**Usage**:
```typescript
import { cn } from '@/lib/utils';

// Basic usage
<div className={cn("px-4 py-2", "bg-white")} />
// → "px-4 py-2 bg-white"

// Conditional classes
<div className={cn(
  "px-4 py-2",
  isActive && "bg-teal-600",
  !isActive && "bg-gray-200"
)} />

// Merging conflicting classes (tailwind-merge)
<div className={cn("px-4", "px-8")} />
// → "px-8" (keeps the last px value)

// Object syntax
<div className={cn({
  "bg-teal-600": isActive,
  "bg-gray-200": !isActive,
  "text-white": true
})} />
```

**Why Use This?**:
- **Conflict Resolution**: Automatically resolves Tailwind class conflicts
- **Conditional Logic**: Clean syntax for conditional classes
- **Type Safety**: Full TypeScript support
- **Performance**: Optimized for runtime merging

**Common Patterns**:
```typescript
// Button variant system
const buttonVariants = {
  primary: "bg-teal-600 text-white",
  secondary: "bg-gray-200 text-gray-900",
  danger: "bg-red-600 text-white"
};

<button className={cn(
  "px-4 py-2 rounded",
  buttonVariants[variant],
  disabled && "opacity-50 cursor-not-allowed"
)} />

// Responsive classes
<div className={cn(
  "w-full",
  "md:w-1/2",
  "lg:w-1/3",
  className // Allow override via props
)} />
```

---

## Backend Utilities

### supabase/functions/make-server-dc1f2437/kv_store.tsx

Key-value store wrapper for Supabase KV storage.

#### `get(key: string)`

Retrieve value from KV store.

**Parameters**:
- `key` (string): Storage key (e.g., `user:abc123`)

**Returns**: `Promise<any>` - Stored value or null

**Usage**:
```typescript
const user = await kv.get(`user:${userId}`);
```

---

#### `set(key: string, value: any)`

Store value in KV store.

**Parameters**:
- `key` (string): Storage key
- `value` (any): Data to store (automatically serialized)

**Returns**: `Promise<void>`

**Usage**:
```typescript
await kv.set(`user:${userId}`, {
  email: 'user@example.com',
  tier: 'free',
  created_at: new Date().toISOString()
});
```

---

#### `del(key: string)`

Delete value from KV store.

**Parameters**:
- `key` (string): Storage key

**Returns**: `Promise<void>`

**Usage**:
```typescript
await kv.del(`project:${userId}:${projectId}`);
```

---

#### `getByPrefix(prefix: string)`

Get all values with keys starting with prefix.

**Parameters**:
- `prefix` (string): Key prefix (e.g., `project:user123:`)

**Returns**: `Promise<any[]>` - Array of values

**Usage**:
```typescript
// Get all projects for a user
const projects = await kv.getByPrefix(`project:${userId}:`);

// Get all feed items for a project
const feedItems = await kv.getByPrefix(`feed:${projectId}:`);
```

**Performance Note**: Returns all matching values, so use specific prefixes to limit results.

---

### KV Store Key Patterns

**Recommended Key Structure**:
```
user:{userId}                    → User profile
project:{userId}:{projectId}     → Project config
feed:{projectId}:{itemId}        → Feed items
last_scan:{projectId}            → Last scan timestamp
```

**Best Practices**:
- Use `:` as separator for hierarchical keys
- Include entity type at start of key
- Use UUIDs for IDs to ensure uniqueness
- Keep keys under 256 characters
- Design for efficient prefix queries

---

## API Client

### src/lib/api.ts

HTTP client for backend API with authentication.

#### `setGetTokenFunction(fn: () => Promise<string | null>)`

Configure authentication token provider.

**Parameters**:
- `fn` (function): Async function returning JWT token or null

**Usage**:
```typescript
import { setGetTokenFunction } from '@/lib/api';
import { useAuth } from '@clerk/clerk-react';

const { getToken } = useAuth();

setGetTokenFunction(async () => {
  try {
    return await getToken();
  } catch {
    return null; // Fallback to Supabase anon key
  }
});
```

---

#### `apiRequest(endpoint: string, options?: RequestInit)`

Low-level API request function with automatic authentication.

**Parameters**:
- `endpoint` (string): API endpoint path (e.g., `/projects`)
- `options` (RequestInit): Fetch options (method, body, headers, etc.)

**Returns**: `Promise<any>` - Parsed JSON response

**Automatic Features**:
- Adds authentication header (JWT or anon key)
- Sets Content-Type: application/json
- Logs request/response for debugging
- Handles errors with detailed messages

**Usage**:
```typescript
const data = await apiRequest('/custom-endpoint', {
  method: 'POST',
  body: JSON.stringify({ test: true })
});
```

---

#### API Methods

All methods in `api` object use `apiRequest` internally.

**User Profile**:
```typescript
api.initProfile()                          // POST /init-profile
api.getUserProfile()                       // GET /user-profile
api.updateUserProfile(updates)             // PATCH /user-profile
```

**Projects**:
```typescript
api.createProject(project)                 // POST /projects
api.getProjects()                          // GET /projects
api.getProject(id)                         // GET /projects/:id
api.updateProject(id, updates)             // PATCH /projects/:id
api.deleteProject(id)                      // DELETE /projects/:id
```

**Subreddits**:
```typescript
api.suggestSubreddits(description, url)    // POST /suggest-subreddits
api.validateSubreddit(subreddit)           // POST /validate-subreddit
```

**Scanning**:
```typescript
api.scanHistory(projectId, subreddits)     // POST /scan-history
api.monitorSubreddits(projectId, subreddits) // POST /monitor-subreddits
api.getFeed(projectId, sort)               // GET /feed/:projectId
```

**AI Generation**:
```typescript
api.generateResponse(projectId, feedItemId, postContent) // POST /generate-response
api.generatePost(projectId, subreddit, prompt, enhance)  // POST /generate-post
api.suggestPosts(projectId)                              // POST /suggest-posts
```

**Feed Management**:
```typescript
api.updateFeedItem(projectId, itemId, updates) // PATCH /feed/:projectId/:itemId
```

**Reddit OAuth**:
```typescript
api.getRedditAuthUrl()                     // GET /reddit/auth
api.getRedditStatus()                      // GET /reddit/status
api.disconnectReddit()                     // POST /reddit/disconnect
```

---

## Reddit Integration

### supabase/functions/make-server-dc1f2437/reddit.tsx

Reddit API integration utilities.

#### `extractKeywords(text: string)`

Extract keywords from text using basic NLP.

**Algorithm**:
1. Convert to lowercase
2. Split on whitespace
3. Filter out stop words (a, the, is, etc.)
4. Keep words > 3 characters
5. Return unique keywords

**Parameters**:
- `text` (string): Text to analyze (typically project description)

**Returns**: `string[]` - Array of keywords

**Usage**:
```typescript
const keywords = reddit.extractKeywords(
  "A productivity tool for developers that automates workflow"
);
// → ["productivity", "tool", "developers", "automates", "workflow"]
```

**Stop Words Excluded**:
- Articles: a, an, the
- Prepositions: in, on, at, for, with
- Conjunctions: and, or, but
- Common verbs: is, are, was, were, be, been

---

#### `calculateRelevanceScore(text: string, keywords: string[], debug?: boolean)`

Calculate how relevant text is to project keywords.

**Algorithm**:
- Uses word boundary regex: `\b{keyword}\b`
- Case-insensitive matching
- 10 points per keyword match
- Counts multiple occurrences

**Parameters**:
- `text` (string): Text to analyze (post title + body)
- `keywords` (string[]): Keywords to match against
- `debug` (boolean): Enable debug logging

**Returns**: `number` - Relevance score (0-100+)

**Usage**:
```typescript
const score = reddit.calculateRelevanceScore(
  "Looking for a productivity tool for developers",
  ["productivity", "developers"]
);
// → 20 (2 keywords × 10 points)
```

**Scoring Examples**:
```typescript
// High relevance
calculateRelevanceScore(
  "Need productivity tools for developers. Workflow automation?",
  ["productivity", "developers", "workflow"]
);
// → 40 (productivity=10, developers=10, workflow=20 [appears twice])

// Medium relevance
calculateRelevanceScore(
  "What tools do you use for development?",
  ["productivity", "developers"]
);
// → 0 ("developers" is part of "development" - no word boundary match)

// Low relevance
calculateRelevanceScore(
  "How to bake bread at home",
  ["productivity", "developers"]
);
// → 0 (no matches)
```

---

#### `isRelevant(text: string, keywords: string[])`

Simple boolean check for keyword presence.

**Parameters**:
- `text` (string): Text to check
- `keywords` (string[]): Keywords to search for

**Returns**: `boolean` - True if any keyword found

**Usage**:
```typescript
if (reddit.isRelevant(text, keywords)) {
  console.log('Post is relevant!');
}
```

---

#### `getSubredditInfo(subreddit: string)`

Get subreddit metadata from Reddit API.

**Parameters**:
- `subreddit` (string): Subreddit name (without r/)

**Returns**: `Promise<RedditSubreddit>` - Subreddit data

**Response Structure**:
```typescript
interface RedditSubreddit {
  display_name: string;      // "webdev"
  title: string;             // "Web Development"
  public_description: string;
  subscribers: number;
  created_utc: number;
  over18: boolean;
}
```

**Usage**:
```typescript
const info = await reddit.getSubredditInfo('webdev');
console.log(info.subscribers); // 1500000
```

**Error Handling**:
- Throws error if subreddit doesn't exist
- Throws error if subreddit is private
- Handles rate limiting

---

#### `getSubredditPosts(subreddit: string, limit: number)`

Fetch recent posts from subreddit (using app credentials).

**Parameters**:
- `subreddit` (string): Subreddit name
- `limit` (number): Max posts to fetch (1-100)

**Returns**: `Promise<{ posts: RedditPost[] }>` - Post data

**Authentication**: Uses Reddit app credentials (not user OAuth)

**Usage**:
```typescript
const { posts } = await reddit.getSubredditPosts('webdev', 50);

posts.forEach(post => {
  console.log(post.title, post.score);
});
```

---

#### `getSubredditPostsWithUserToken(accessToken: string, subreddit: string, limit: number)`

Fetch posts using user's OAuth token (higher rate limits).

**Parameters**:
- `accessToken` (string): User's Reddit OAuth access token
- `subreddit` (string): Subreddit name
- `limit` (number): Max posts to fetch

**Returns**: `Promise<{ posts: RedditPost[] }>` - Post data

**Usage**:
```typescript
const userToken = await reddit.getUserToken(profile.reddit);
const { posts } = await reddit.getSubredditPostsWithUserToken(
  userToken,
  'webdev',
  100
);
```

---

#### Reddit OAuth Functions

**`exchangeCodeForToken(code: string, redirectUri: string)`**:
Exchange OAuth authorization code for access/refresh tokens.

**`getUserIdentity(accessToken: string)`**:
Get Reddit user identity (username, etc.).

**`getUserToken(tokens: RedditTokens)`**:
Get valid access token, refreshing if expired.

**`refreshUserToken(refreshToken: string)`**:
Refresh expired access token using refresh token.

**Token Structure**:
```typescript
interface RedditTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;        // Unix timestamp
  scope: string;             // "identity read submit"
  username: string;
}
```

---

## AI Integration

### supabase/functions/make-server-dc1f2437/openai.tsx

Azure OpenAI integration for response generation.

#### `callAzureOpenAI(messages: Message[], systemPrompt?: string)`

Generate text completion using Azure OpenAI gpt-5-mini.

**Parameters**:
- `messages` (Message[]): Conversation messages
- `systemPrompt` (string, optional): System instructions

**Message Structure**:
```typescript
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
```

**Returns**: `Promise<string>` - AI-generated text

**Usage**:
```typescript
const response = await openai.callAzureOpenAI([
  { role: 'user', content: 'Generate a Reddit post about my app' }
], 'You are a helpful Reddit marketer');

console.log(response);
// → "Hey r/webdev! I built a tool that..."
```

**Important Limitations** (gpt-5-mini):
- ONLY supports `max_completion_tokens` (NOT `max_tokens`)
- ONLY supports default temperature (1)
- NO temperature, top_p, frequency_penalty, presence_penalty customization

**Configuration**:
```typescript
const config = {
  model: 'gpt-5-mini',
  max_completion_tokens: 500,
  temperature: 1,  // Fixed, cannot change
};
```

---

#### `safeJSONParse(text: string, fallback: any)`

Parse AI-generated JSON, handling markdown code blocks.

**Problem**: AI models sometimes wrap JSON in markdown code blocks:
```markdown
Here's the JSON:
```json
{"key": "value"}
```
```

**Solution**: Automatically strips markdown and extracts JSON.

**Parameters**:
- `text` (string): AI response text
- `fallback` (any): Return value if parsing fails

**Returns**: Parsed JSON or fallback

**Usage**:
```typescript
const aiResponse = `Sure! Here's the JSON:\n\`\`\`json\n["webdev", "programming"]\n\`\`\``;

const subreddits = openai.safeJSONParse(aiResponse, []);
// → ["webdev", "programming"]
```

**Handles**:
- Markdown code blocks (```json ... ```)
- Plain JSON strings
- Malformed JSON (returns fallback)
- Extra whitespace and formatting

---

### supabase/functions/make-server-dc1f2437/openrouter.tsx

OpenRouter integration for accessing Perplexity Sonar.

#### `callOpenRouter(messages: Message[], systemPrompt: string, options?: OpenRouterOptions)`

Call OpenRouter API with Perplexity Sonar model.

**Parameters**:
- `messages` (Message[]): Conversation messages
- `systemPrompt` (string): System instructions
- `options` (object, optional):
  - `model` (string): Model to use (default: 'perplexity/sonar')
  - `max_tokens` (number): Max response length

**Returns**: `Promise<string>` - AI response

**Usage**:
```typescript
const response = await openrouter.callOpenRouter([
  { role: 'user', content: 'Suggest subreddits for my productivity app' }
], 'You are a Reddit expert', {
  model: 'perplexity/sonar'
});
```

**When to Use OpenRouter vs Azure OpenAI**:
- **OpenRouter (Perplexity)**: Subreddit suggestions, keyword extraction (real-time knowledge)
- **Azure OpenAI**: Response generation, post creation (text generation)

---

#### `safeJSONParse(text: string, fallback: any)`

Same as OpenAI version - parse AI JSON with markdown handling.

---

## Environment Variables

### Frontend (.env.local)

```bash
# Supabase
VITE_SUPABASE_URL=https://vcdfzxjlahsajulpxzsn.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxx
```

### Backend (Supabase Secrets)

```bash
# Set via CLI
supabase secrets set VARIABLE_NAME=value --project-ref vcdfzxjlahsajulpxzsn

# Required Secrets
CLERK_SECRET_KEY=sk_live_xxx
REDDIT_CLIENT_ID=xxx
REDDIT_CLIENT_SECRET=xxx
AZURE_OPENAI_API_KEY=xxx
AZURE_OPENAI_ENDPOINT=https://xxx.openai.azure.com/
OPEN_ROUTER_API_KEY=xxx
INNGEST_EVENT_KEY=evt_xxx
SECURITY_MODE=strict  # or 'dev'
ALLOWED_ORIGINS=https://pubhub.dev
```

---

## Helper Functions

### Date Formatting

```typescript
// Format Reddit timestamp
function formatRedditTimestamp(utc: number): string {
  return new Date(utc * 1000).toISOString();
}

// Relative time (e.g., "2 hours ago")
function timeAgo(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = now - then;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
```

### String Utilities

```typescript
// Truncate text
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Slugify (for URLs)
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}
```

### Validation

```typescript
// Subreddit name validation
function isValidSubredditName(name: string): boolean {
  return /^[a-zA-Z0-9_]{3,21}$/.test(name);
}

// Email validation
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

---

## Performance Utilities

### Debounce

```typescript
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Usage
const debouncedSearch = debounce(searchSubreddits, 300);
```

### Throttle

```typescript
function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Usage
const throttledScroll = throttle(handleScroll, 100);
```

---

## Error Handling

### Custom Error Classes

```typescript
class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Usage
throw new APIError('Project not found', 404, { projectId });
```

### Error Logging

```typescript
function logError(error: Error, context?: Record<string, any>) {
  console.error('[ERROR]', error.message);
  console.error('Context:', context);
  console.error('Stack:', error.stack);

  // In production, send to error tracking service
  // e.g., Sentry, LogRocket, etc.
}
```

---

**Last Updated**: 2025-10-15
**Framework**: React + Vite + TypeScript + Supabase Edge Functions
