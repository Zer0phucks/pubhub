# Inngest Background Jobs Setup Guide

## Overview

PubHub now uses **Inngest** for background job processing to handle:
- Reddit subreddit scanning (parallelized, async)
- Scheduled monitoring every 15 minutes
- AI response generation
- Keyword extraction for new projects

## Architecture

```
Frontend Request → Edge Function → Inngest Event → Background Job → KV Store
                                      ↓
                               Inngest Dashboard
                               (Monitoring & Logs)
```

### Benefits
- ✅ **Non-blocking**: API responds immediately, work happens in background
- ✅ **Retries**: Automatic retry on failures (configured per function)
- ✅ **Rate Limiting**: Per-user rate limits prevent abuse
- ✅ **Monitoring**: Built-in dashboard for job tracking
- ✅ **Parallel Processing**: Subreddits scanned in parallel
- ✅ **Scheduled Jobs**: Auto-monitor every 15 minutes

---

## Environment Variables

Add these to your Supabase Edge Function secrets:

```bash
# Inngest Configuration
INNGEST_EVENT_KEY=your_inngest_event_key_here

# Existing variables (no changes needed)
REDDIT_CLIENT_ID=...
REDDIT_CLIENT_SECRET=...
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=...
OPEN_ROUTER_API_KEY=...
CLERK_SECRET_KEY=...
SUPABASE_ANON_KEY=...
```

### Getting Inngest Keys

1. **Sign up**: https://www.inngest.com/
2. **Create app**: Name it "pubhub"
3. **Get Event Key**: Dashboard → Settings → Event Keys
4. **Set Secret**:
   ```bash
   supabase secrets set INNGEST_EVENT_KEY=evt_xxxx --project-ref vcdfzxjlahsajulpxzsn
   ```

---

## Deployment

### 1. Deploy Edge Function

```bash
cd /home/noob/pubhub
supabase functions deploy make-server-dc1f2437 --project-ref vcdfzxjlahsajulpxzsn --no-verify-jwt
```

### 2. Register with Inngest

After deployment, register your Edge Function endpoint with Inngest:

1. **Go to Inngest Dashboard** → Apps → pubhub
2. **Add Serve Handler**:
   - URL: `https://vcdfzxjlahsajulpxzsn.supabase.co/functions/v1/make-server-dc1f2437/inngest`
   - Signing Key: (auto-generated)
3. **Sync Functions**: Inngest will discover all 4 background functions

### 3. Verify Deployment

Check health endpoint:
```bash
curl https://vcdfzxjlahsajulpxzsn.supabase.co/functions/v1/make-server-dc1f2437/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-15T10:30:00.000Z",
  "message": "PubHub API is running"
}
```

---

## Inngest Functions

### 1. Reddit Scan (On-Demand)

**Event**: `reddit/scan.requested`
**Trigger**: User clicks "Scan Now" in Feed
**Rate Limit**: 10 scans per hour per user
**Retries**: 2 attempts

**Steps**:
1. Load project data
2. Get/refresh Reddit tokens
3. Validate access token
4. Scan subreddits **in parallel** (major performance improvement)
5. Save feed items to KV store

**Frontend Integration**:
```typescript
// In Feed.tsx, handleScanNow() now triggers:
await api.scanHistory(projectId, subreddits);

// Returns immediately:
{
  status: 'scanning',
  message: 'Scan started in background...',
  projectId: '...',
  subreddits: 3
}
```

### 2. Scheduled Monitoring (Automated)

**Event**: N/A (cron-based)
**Schedule**: Every 15 minutes (`*/15 * * * *`)
**Retries**: 1 attempt

**Steps**:
1. Find all active projects with subreddits
2. For each project, check for new posts since last scan
3. Save relevant new items to feed
4. Update `last_scan` timestamp

**Monitoring**:
- Check Inngest Dashboard → `reddit-monitor-subreddits` for execution history
- Logs show how many projects were monitored and new items found

### 3. AI Response Generation

**Event**: `ai/response.generate`
**Trigger**: User clicks "Generate Response" on feed item
**Rate Limit**: 50 responses per hour per user
**Retries**: 2 attempts

**Steps**:
1. Load project details
2. Generate response using Azure OpenAI
3. Save response to feed item with timestamp

**Frontend Integration**:
```typescript
// In FeedItem.tsx
await inngest.send({
  name: 'ai/response.generate',
  data: {
    projectId,
    userId,
    feedItemId,
    postContent,
    persona: project.persona
  }
});
```

### 4. Keyword Generation

**Event**: `project/keywords.generate`
**Trigger**: Project creation (can be async)
**Retries**: 1 attempt

**Steps**:
1. Extract keywords using OpenRouter/Perplexity AI
2. Fallback to regex-based extraction if AI fails
3. Save keywords to project

---

## Frontend Changes

### API Response Changes

**Before (Inline Scanning)**:
```json
{
  "scanned": 150,
  "newItems": 5,
  "items": [...],
  "debug": {...}
}
```

**After (Background Scanning)**:
```json
{
  "status": "scanning",
  "message": "Scan started in background...",
  "projectId": "abc-123",
  "subreddits": 3
}
```

### UI Updates Needed

**Feed.tsx** changes required:
1. ✅ Show "Scanning in background..." message
2. ⏳ Poll `/feed/:projectId` endpoint every 5 seconds during scan
3. ⏳ Show notification when new items appear
4. ⏳ Update progress indicator (can estimate based on subreddit count)

**Recommended Implementation**:
```typescript
const handleScanNow = async () => {
  setScanning(true);

  try {
    const result = await api.scanHistory(projectId, subreddits);

    if (result.status === 'scanning') {
      toast.info('Scan started in background');

      // Poll for new items every 5 seconds
      const pollInterval = setInterval(async () => {
        const feed = await api.getFeed(projectId);
        if (feed.length > items.length) {
          setItems(feed);
          toast.success(`Found ${feed.length - items.length} new items!`);
          clearInterval(pollInterval);
          setScanning(false);
        }
      }, 5000);

      // Stop polling after 60 seconds
      setTimeout(() => {
        clearInterval(pollInterval);
        setScanning(false);
      }, 60000);
    }
  } catch (error) {
    toast.error('Scan failed');
    setScanning(false);
  }
};
```

---

## Monitoring & Debugging

### Inngest Dashboard

Access: https://app.inngest.com/

**Key Sections**:
- **Functions**: View all 4 registered functions
- **Runs**: See execution history, logs, and errors
- **Events**: Track all events sent (useful for debugging)
- **Metrics**: Response times, success rates, retry counts

### Logging

**Backend Logs** (Supabase Functions Dashboard):
```
[Inngest][Scan] Starting scan: 1 days for free tier, 5 keywords
[Inngest][Scan] r/webdev: 3 relevant posts found
[Inngest][Scan] Complete: 3 matches from 150 posts
```

**Frontend Logs** (Browser Console):
```
==================== SCAN NOW STARTING ====================
[Scan] Triggering Inngest background job
Scan started in background...
```

### Common Issues

**Issue**: Functions not appearing in Inngest Dashboard
**Solution**: Re-sync functions from Dashboard → Apps → pubhub → Sync

**Issue**: Events not triggering jobs
**Solution**: Check Event Key is correct in Supabase secrets

**Issue**: Jobs failing with auth errors
**Solution**: Verify Reddit tokens are valid, check `redis/status` endpoint

**Issue**: Scheduled monitoring not running
**Solution**: Check Inngest Dashboard → Functions → Enable/Disable toggle

---

## Performance Improvements

### Before (Inline Scanning)
- Sequential subreddit scanning: ~3 seconds per subreddit
- API request blocks for entire duration
- 3 subreddits = 9+ seconds blocking

### After (Background with Inngest)
- API responds immediately (< 100ms)
- Parallel subreddit scanning: ~3-5 seconds total
- 3 subreddits = ~4 seconds in background (60% faster)

### Scalability
- **Before**: 1 user scanning = 9 seconds of Edge Function compute
- **After**: Unlimited concurrent scans, no blocking
- **Rate Limiting**: 10 scans/hour prevents abuse
- **Scheduled Monitoring**: Proactive feed population

---

## Testing Checklist

### Manual Testing

1. **Scan Now Button**:
   ```
   - [ ] Click "Scan Now" in Feed
   - [ ] Verify toast shows "Scan started in background"
   - [ ] Check Inngest Dashboard for new run
   - [ ] Refresh feed after 10 seconds
   - [ ] Verify new items appear
   ```

2. **Scheduled Monitoring**:
   ```
   - [ ] Wait 15 minutes
   - [ ] Check Inngest Dashboard for auto-run
   - [ ] Verify last_scan timestamp updated
   - [ ] Check for new feed items
   ```

3. **AI Response Generation**:
   ```
   - [ ] Click "Generate Response" on feed item
   - [ ] Verify background job triggered
   - [ ] Reload feed after 5 seconds
   - [ ] Verify ai_response field populated
   ```

4. **Error Handling**:
   ```
   - [ ] Trigger scan without Reddit connection
   - [ ] Verify error message displayed
   - [ ] Check Inngest shows failure with retry
   ```

### Automated Testing

**Add to `src/lib/__tests__/api.test.ts`**:
```typescript
describe('Inngest Background Jobs', () => {
  it('returns scanning status immediately', async () => {
    const result = await api.scanHistory('project-123', ['webdev']);
    expect(result.status).toBe('scanning');
    expect(result.message).toContain('background');
  });
});
```

---

## Rollback Plan

If Inngest causes issues, revert to inline scanning:

### 1. Comment out Inngest imports in `index.ts`:
```typescript
// import { serve } from 'npm:inngest/hono';
// import { inngest } from './inngest.ts';
// import { functions } from './inngest-functions.ts';
```

### 2. Comment out Inngest serve endpoint:
```typescript
// app.on(['GET', 'POST', 'PUT'], '/make-server-dc1f2437/inngest', serve({
//   client: inngest,
//   functions,
// }));
```

### 3. Restore inline scanning (code is preserved in comments)

### 4. Redeploy:
```bash
supabase functions deploy make-server-dc1f2437 --project-ref vcdfzxjlahsajulpxzsn --no-verify-jwt
```

---

## Next Steps

1. ✅ Deploy Edge Function with Inngest
2. ⏳ Update Frontend polling logic
3. ⏳ Add WebSocket support for real-time updates (future enhancement)
4. ⏳ Add Inngest metrics to admin dashboard
5. ⏳ Implement job cancellation UI
6. ⏳ Add email notifications for completed scans

---

## Resources

- **Inngest Docs**: https://www.inngest.com/docs
- **Inngest Hono Guide**: https://www.inngest.com/docs/sdk/serve#hono
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions
- **PubHub Repo**: /home/noob/pubhub

---

**Questions?** Check Inngest Dashboard logs or Supabase Function logs for detailed error messages.
