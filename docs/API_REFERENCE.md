# PubHub API Reference

Complete reference for PubHub backend API endpoints.

**Base URL**: `https://vcdfzxjlahsajulpxzsn.supabase.co/functions/v1/make-server-dc1f2437`

---

## Authentication

All API endpoints require authentication via Bearer token in the Authorization header.

```http
Authorization: Bearer <your_jwt_token>
```

**Token Types**:
- **Clerk JWT** (Preferred): Obtained from Clerk authentication
- **Supabase Anon Key** (Fallback): Public anon key for dev mode

**Security Modes**:
- `strict`: Requires verified Clerk JWT (production)
- `dev`: Allows unverified JWT with demo user fallback (development)

---

## Health & System

### GET /health

Health check endpoint to verify API is running.

**Response** `200 OK`:
```json
{
  "status": "ok",
  "timestamp": "2025-10-15T10:30:00.000Z",
  "message": "PubHub API is running"
}
```

---

## User Profile

### POST /init-profile

Initialize user profile after Clerk signup. Creates default profile if doesn't exist.

**Response** `200 OK`:
```json
{
  "id": "user_2abc123",
  "email": "user@example.com",
  "name": "John Doe",
  "tier": "free",
  "theme": "system",
  "created_at": "2025-10-15T10:00:00.000Z"
}
```

---

### GET /user-profile

Get current user's profile.

**Response** `200 OK`:
```json
{
  "id": "user_2abc123",
  "email": "user@example.com",
  "name": "John Doe",
  "tier": "free",
  "theme": "dark",
  "reddit": {
    "username": "reddit_user",
    "connected_at": "2025-10-15T10:00:00.000Z"
  }
}
```

**Errors**:
- `404 Not Found`: Profile not found

---

### PATCH /user-profile

Update user profile.

**Request Body**:
```json
{
  "theme": "dark",
  "name": "New Name"
}
```

**Response** `200 OK`:
```json
{
  "id": "user_2abc123",
  "email": "user@example.com",
  "name": "New Name",
  "tier": "free",
  "theme": "dark"
}
```

---

## Projects

### POST /projects

Create a new project with AI-generated keywords.

**Request Body**:
```json
{
  "name": "My Awesome App",
  "description": "A productivity tool for developers",
  "url": "https://myapp.com",
  "icon": "🚀",
  "subreddits": ["webdev", "programming"],
  "persona": "Friendly developer advocate"
}
```

**Response** `200 OK`:
```json
{
  "id": "proj_123",
  "userId": "user_2abc123",
  "name": "My Awesome App",
  "description": "A productivity tool for developers",
  "url": "https://myapp.com",
  "icon": "🚀",
  "subreddits": ["webdev", "programming"],
  "keywords": ["productivity", "developers", "automation", "workflow"],
  "persona": "Friendly developer advocate",
  "settings": {
    "aiResponses": true,
    "notifications": {
      "dms": true,
      "comments": true,
      "posts": true
    }
  },
  "created_at": "2025-10-15T10:00:00.000Z"
}
```

**Project Limits by Tier**:
- `free`: 1 project
- `basic`: 5 projects
- `pro`: Unlimited projects

**Errors**:
- `400 Bad Request`: Project limit reached

---

### GET /projects

Get all projects for current user.

**Response** `200 OK`:
```json
[
  {
    "id": "proj_123",
    "name": "My Awesome App",
    "description": "...",
    "subreddits": ["webdev"],
    "keywords": ["productivity"],
    "created_at": "2025-10-15T10:00:00.000Z"
  }
]
```

---

### GET /projects/:id

Get a specific project by ID.

**Path Parameters**:
- `id` (string): Project ID

**Response** `200 OK`:
```json
{
  "id": "proj_123",
  "name": "My Awesome App",
  "description": "...",
  "subreddits": ["webdev"]
}
```

**Errors**:
- `404 Not Found`: Project not found

---

### PATCH /projects/:id

Update a project.

**Path Parameters**:
- `id` (string): Project ID

**Request Body**:
```json
{
  "name": "Updated Name",
  "subreddits": ["webdev", "coding"],
  "persona": "Updated persona"
}
```

**Response** `200 OK`:
```json
{
  "id": "proj_123",
  "name": "Updated Name",
  "subreddits": ["webdev", "coding"],
  "persona": "Updated persona"
}
```

---

### DELETE /projects/:id

Delete a project and all associated feed items.

**Path Parameters**:
- `id` (string): Project ID

**Response** `200 OK`:
```json
{
  "success": true
}
```

---

## Subreddit Management

### POST /suggest-subreddits

Get AI-powered subreddit suggestions based on app description.

**Request Body**:
```json
{
  "description": "A productivity tool for developers",
  "url": "https://myapp.com"
}
```

**Response** `200 OK`:
```json
{
  "subreddits": [
    "webdev",
    "programming",
    "productivity",
    "SideProject",
    "Entrepreneur"
  ]
}
```

**AI Model**: Uses OpenRouter with Perplexity Sonar for real-time subreddit discovery.

---

### POST /validate-subreddit

Validate if a subreddit exists and get its info.

**Request Body**:
```json
{
  "subreddit": "webdev"
}
```

**Response** `200 OK`:
```json
{
  "valid": true,
  "info": {
    "name": "webdev",
    "title": "Web Development",
    "subscribers": 1500000,
    "description": "A community for web developers"
  }
}
```

**Response** `200 OK` (Invalid):
```json
{
  "valid": false,
  "error": "Subreddit not found or is private"
}
```

---

## Reddit Scanning

### POST /scan-history

Trigger background scan of subreddits for relevant posts (Inngest background job).

**Request Body**:
```json
{
  "projectId": "proj_123",
  "subreddits": ["webdev", "programming"]
}
```

**Response** `200 OK`:
```json
{
  "status": "scanning",
  "message": "Scan started in background. Results will appear in your feed shortly.",
  "projectId": "proj_123",
  "subreddits": 2
}
```

**Scan Configuration by Tier**:
- `free`: Scans last 1 day
- `basic`: Scans last 30 days
- `pro`: Scans last 90 days

**Background Processing**:
- Scan runs via Inngest background job
- Results appear in feed within 5-10 seconds
- Subreddits are scanned in parallel

**Errors**:
- `403 Forbidden`: Reddit account not connected
- `404 Not Found`: Project not found

---

### POST /monitor-subreddits

Monitor subreddits for new posts since last scan (real-time monitoring).

**Request Body**:
```json
{
  "projectId": "proj_123",
  "subreddits": ["webdev"]
}
```

**Response** `200 OK`:
```json
{
  "newItems": 3,
  "items": [
    {
      "id": "item_123",
      "type": "post",
      "title": "Looking for productivity tools",
      "subreddit": "webdev",
      "relevance_score": 35
    }
  ]
}
```

**Scheduled Monitoring**: Runs automatically every 15 minutes via Inngest.

---

## Feed Management

### GET /feed/:projectId

Get feed items for a project with optional sorting.

**Path Parameters**:
- `projectId` (string): Project ID

**Query Parameters**:
- `sort` (string, optional): Sort order
  - `recent` (default): Most recent first
  - `engagement`: By score + comments
  - `relevance`: By relevance score

**Response** `200 OK`:
```json
[
  {
    "id": "item_123",
    "projectId": "proj_123",
    "type": "post",
    "subreddit": "webdev",
    "title": "Looking for productivity tools",
    "content": "I need a tool that...",
    "author": "reddit_user",
    "url": "https://reddit.com/r/webdev/comments/abc123",
    "reddit_id": "abc123",
    "score": 45,
    "num_comments": 12,
    "relevance_score": 35,
    "created_at": "2025-10-15T09:00:00.000Z",
    "ai_response": "Check out our tool...",
    "status": "pending"
  }
]
```

**Feed Item Statuses**:
- `pending`: Not yet responded to
- `approved`: Ready to post
- `posted`: Already posted to Reddit
- `ignored`: Marked as not relevant

---

### PATCH /feed/:projectId/:itemId

Update a feed item (e.g., change status, edit AI response).

**Path Parameters**:
- `projectId` (string): Project ID
- `itemId` (string): Feed item ID

**Request Body**:
```json
{
  "status": "approved",
  "ai_response": "Updated response text"
}
```

**Response** `200 OK`:
```json
{
  "id": "item_123",
  "status": "approved",
  "ai_response": "Updated response text"
}
```

---

## AI Generation

### POST /generate-response

Generate AI response for a Reddit post/comment.

**Request Body**:
```json
{
  "projectId": "proj_123",
  "feedItemId": "item_123",
  "postContent": "Looking for a good productivity tool for developers"
}
```

**Response** `200 OK`:
```json
{
  "response": "Have you checked out our tool? It helps developers streamline their workflow by..."
}
```

**AI Model**: Azure OpenAI gpt-5-mini

**Response Guidelines**:
- Conversational and engaging
- Under 200 words
- Tailored to project persona
- Contextual to the post content

---

### POST /generate-post

Generate a Reddit post for a specific subreddit.

**Request Body**:
```json
{
  "projectId": "proj_123",
  "subreddit": "webdev",
  "userPrompt": "Announce our new feature",
  "enhance": false
}
```

**Parameters**:
- `userPrompt` (string, optional): User guidance for the post
- `enhance` (boolean): If true, enhances existing user-written post

**Response** `200 OK`:
```json
{
  "post": "Hey r/webdev! 👋 We just launched a new feature that..."
}
```

---

### POST /suggest-posts

Get AI-generated post idea suggestions for a project.

**Request Body**:
```json
{
  "projectId": "proj_123"
}
```

**Response** `200 OK`:
```json
{
  "suggestions": [
    "Share a case study of how our tool helped a developer save 10 hours/week",
    "Ask the community: What's your biggest productivity challenge?",
    "Announce our new integration with popular dev tools"
  ]
}
```

---

## Reddit OAuth

### GET /reddit/auth

Initiate Reddit OAuth flow - returns authorization URL.

**Response** `200 OK`:
```json
{
  "authUrl": "https://www.reddit.com/api/v1/authorize?client_id=...&redirect_uri=..."
}
```

**OAuth Scopes**:
- `identity`: Read user identity
- `read`: Read posts and comments
- `submit`: Submit posts and comments

**Flow**:
1. Frontend requests `/reddit/auth`
2. Backend returns `authUrl`
3. User authorizes on Reddit
4. Reddit redirects to `/reddit/callback`
5. Backend exchanges code for tokens
6. User profile updated with Reddit credentials

---

### GET /reddit/callback

OAuth callback handler (not called directly - Reddit redirects here).

**Query Parameters**:
- `code` (string): Authorization code from Reddit
- `state` (string): User ID for verification
- `error` (string, optional): Error if auth failed

**Redirect**: `https://pubhub.dev/?reddit_connected=true` (or with `reddit_error`)

---

### GET /reddit/status

Check if user has connected Reddit account.

**Response** `200 OK` (Connected):
```json
{
  "connected": true,
  "username": "reddit_username",
  "connected_at": "2025-10-15T10:00:00.000Z"
}
```

**Response** `200 OK` (Not Connected):
```json
{
  "connected": false
}
```

---

### POST /reddit/disconnect

Disconnect Reddit account from user profile.

**Response** `200 OK`:
```json
{
  "success": true
}
```

---

## Inngest Background Jobs

The API uses Inngest for background job processing. These are not called directly but triggered internally.

### /inngest

Inngest serve endpoint for background jobs.

**Background Functions**:

1. **scanRedditSubreddits** (`reddit/scan.requested`)
   - Scans subreddits for relevant posts
   - Parallel subreddit processing
   - Rate limit: 10 scans/hour per user

2. **redditMonitorSubreddits** (Cron: every 15 minutes)
   - Automatic monitoring of active projects
   - Discovers new posts since last scan

3. **generateAIResponse** (`ai/response.generate`)
   - Background AI response generation
   - Rate limit: 50 responses/hour per user

4. **generateProjectKeywords** (`project/keywords.generate`)
   - AI keyword extraction for new projects
   - Fallback to regex-based extraction

---

## Error Responses

All endpoints may return these standard error responses:

### 401 Unauthorized
```json
{
  "error": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "error": "Reddit account not connected. Please connect your Reddit account in settings.",
  "requiresRedditAuth": true
}
```

### 404 Not Found
```json
{
  "error": "Project not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Detailed error message"
}
```

---

## Rate Limits

**Inngest Rate Limits** (per user):
- Reddit scans: 10 per hour
- AI response generation: 50 per hour
- Keyword generation: Unlimited

**Reddit API Rate Limits**:
- 60 requests per minute
- Handled automatically with exponential backoff

---

## Data Storage

**KV Store Keys**:
```
user:{userId}                    → User profile
project:{userId}:{projectId}     → Project configuration
feed:{projectId}:{itemId}        → Feed items
last_scan:{projectId}            → Last scan timestamp
```

---

## Security

**Production Configuration**:
```bash
SECURITY_MODE=strict
ALLOWED_ORIGINS=https://pubhub.dev,https://www.pubhub.dev
```

**Environment Variables**:
- `CLERK_SECRET_KEY`: Clerk API key for JWT verification
- `REDDIT_CLIENT_ID`: Reddit OAuth client ID
- `REDDIT_CLIENT_SECRET`: Reddit OAuth secret
- `AZURE_OPENAI_API_KEY`: Azure OpenAI API key
- `OPEN_ROUTER_API_KEY`: OpenRouter API key for Perplexity
- `INNGEST_EVENT_KEY`: Inngest event key
- `SECURITY_MODE`: `strict` (production) or `dev` (development)
- `ALLOWED_ORIGINS`: Comma-separated allowed CORS origins

---

## Example API Flows

### Complete Project Setup Flow

```typescript
// 1. Initialize profile
const profile = await fetch(`${API_BASE}/init-profile`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${clerkToken}` }
});

// 2. Create project
const project = await fetch(`${API_BASE}/projects`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${clerkToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'My App',
    description: 'Productivity tool',
    subreddits: ['webdev']
  })
});

// 3. Connect Reddit (optional)
const { authUrl } = await fetch(`${API_BASE}/reddit/auth`, {
  headers: { 'Authorization': `Bearer ${clerkToken}` }
}).then(r => r.json());

// User authorizes on Reddit...

// 4. Scan subreddits
await fetch(`${API_BASE}/scan-history`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${clerkToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    projectId: project.id,
    subreddits: ['webdev']
  })
});

// 5. Poll for feed items
setInterval(async () => {
  const feed = await fetch(
    `${API_BASE}/feed/${project.id}?sort=recent`,
    { headers: { 'Authorization': `Bearer ${clerkToken}` } }
  ).then(r => r.json());

  console.log(`Found ${feed.length} relevant posts`);
}, 5000);
```

---

**Last Updated**: 2025-10-15
**API Version**: 1.0
