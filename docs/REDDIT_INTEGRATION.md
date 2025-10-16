# Reddit API Integration Guide

## Overview

PubHub now has comprehensive Reddit API integration that allows you to monitor subreddits, discover engagement opportunities, and interact with your Reddit community. This document explains how the integration works and how to use it.

## Setup

### 1. Reddit API Credentials

You need to create a Reddit application to get API credentials:

1. Go to https://www.reddit.com/prefs/apps
2. Click "create another app" or "are you a developer? create an app..."
3. Fill in the form:
   - **Name**: PubHub (or your app name)
   - **App type**: Select "script"
   - **Description**: Reddit monitoring for app developers
   - **About URL**: Your website
   - **Redirect URI**: http://localhost (not used for script apps)
4. Click "create app"
5. Copy your credentials:
   - **Client ID**: The string under "personal use script"
   - **Client Secret**: The "secret" field

### 2. Configure Environment Variables

The Reddit credentials have been added to your Supabase secrets:
- `REDDIT_CLIENT_ID`
- `REDDIT_CLIENT_SECRET`

## Features

### 1. Subreddit Validation

When adding subreddits to monitor, PubHub automatically validates them:
- Checks if the subreddit name format is correct (3-21 characters, alphanumeric + underscore)
- Verifies the subreddit exists and is accessible
- Shows subscriber count and description
- Prevents adding private or non-existent subreddits

**Usage**: In Project Settings, type a subreddit name and click the + button. PubHub will validate it before adding.

### 2. Historical Scanning

Scan historical Reddit posts and comments based on your tier:
- **Free tier**: Not available
- **Basic tier**: 30 days of history
- **Pro tier**: 90 days of history

**How it works**:
- Extracts keywords from your project description
- Searches monitored subreddits for relevant posts
- Calculates relevance scores based on keyword matching
- For highly relevant posts, also scans comments
- Stores all relevant items in your feed

**API Endpoint**: `POST /scan-history`
```json
{
  "projectId": "uuid",
  "subreddits": ["webdev", "SaaS", "startups"]
}
```

### 3. Real-time Monitoring

Monitor subreddits for new posts in real-time:
- Checks for new posts since the last scan
- Only processes posts created after the last check
- Automatically filters for relevance
- Prevents duplicate feed items
- Updates last scan timestamp

**API Endpoint**: `POST /monitor-subreddits`
```json
{
  "projectId": "uuid",
  "subreddits": ["webdev", "SaaS"]
}
```

**Recommended usage**: Set up a periodic check (e.g., every 15 minutes) using a cron job or scheduled function.

### 4. Relevance Scoring

PubHub uses an intelligent relevance scoring system:

**Keyword Extraction**:
- Automatically extracts meaningful keywords from your project description
- Removes common stop words
- Focuses on words longer than 3 characters

**Relevance Calculation**:
- Searches for exact keyword matches in post title and content
- Uses word boundaries for accurate matching
- Scores based on number of matches (10 points per match)
- Higher scores = more relevant content

**Example**:
```
Project: "AI-powered task management tool for developers"
Keywords: ["powered", "task", "management", "tool", "developers"]
Post: "Looking for a task management tool for my dev team"
Score: 30 (3 keyword matches × 10)
```

### 5. Feed Item Types

PubHub tracks different types of Reddit content:

**Posts**:
- Title, content, author
- Score (upvotes) and comment count
- Direct link to Reddit post
- Relevance score

**Comments**:
- Comment body and author
- Parent post context
- Score and permalink
- Relevance score

**Structure**:
```json
{
  "id": "uuid",
  "projectId": "uuid",
  "type": "post" | "comment",
  "subreddit": "webdev",
  "title": "Post title",
  "content": "Post/comment content",
  "author": "reddit_username",
  "url": "https://reddit.com/r/webdev/...",
  "reddit_id": "abc123",
  "score": 42,
  "num_comments": 15,
  "relevance_score": 30,
  "created_at": "2025-01-15T10:30:00Z",
  "ai_response": null,
  "status": "pending"
}
```

## Technical Implementation

### Authentication

PubHub uses Reddit's OAuth2 client credentials flow:
1. Encodes client ID and secret as Base64
2. Requests access token from Reddit
3. Caches token until expiry (minus 1 minute buffer)
4. Automatically refreshes when needed

### Rate Limiting

Reddit's API rate limits:
- 60 requests per minute for OAuth apps
- 600 requests per 10 minutes
- PubHub respects these limits by:
  - Caching tokens
  - Batching requests
  - Using appropriate limits in API calls

### Error Handling

The integration handles various error scenarios:
- Invalid Reddit credentials
- Subreddit not found or private
- Rate limit exceeded
- Network timeouts
- Malformed responses

All errors are logged with context for debugging.

## Best Practices

### 1. Choose Relevant Subreddits
- Use AI subreddit suggestions when creating a project
- Focus on niche communities related to your app
- Avoid extremely large subreddits (may have too much noise)
- Test with 2-3 subreddits before adding more

### 2. Optimize Your Project Description
- Include specific keywords your target users would mention
- Be descriptive but concise
- Include your app's main features and use cases
- Update the description if relevance scoring isn't working well

### 3. Monitor Regularly
- Set up automated monitoring (every 15-30 minutes)
- Check your feed daily
- Respond to high-relevance items quickly
- Use the relevance score to prioritize

### 4. Respect Reddit's Rules
- Read each subreddit's rules before engaging
- Don't spam or over-promote
- Provide genuine value in responses
- Be transparent about being a developer
- Let AI help, but always review and personalize responses

## API Reference

### Reddit Module Functions

**`getRedditToken()`**
- Returns cached or fresh OAuth token
- Automatically refreshes when expired
- Throws error if credentials not configured

**`getSubredditPosts(subreddit, limit, after)`**
- Fetches recent posts from a subreddit
- Supports pagination with `after` parameter
- Returns posts array and next page token

**`getPostComments(subreddit, postId, limit)`**
- Fetches all comments from a specific post
- Flattens nested comment structure
- Returns flat array of comment objects

**`getSubredditInfo(subreddit)`**
- Gets subreddit metadata
- Returns name, title, subscribers, description
- Used for validation

**`isRelevant(text, keywords)`**
- Checks if text contains relevant keywords
- Boolean relevance check
- Used as backup to scoring

**`calculateRelevanceScore(text, keywords)`**
- Calculates numeric relevance score
- Based on keyword match count
- Returns score (0 = not relevant, higher = more relevant)

**`extractKeywords(description)`**
- Extracts meaningful keywords from text
- Removes common stop words
- Returns unique keyword array

**`isValidSubredditName(name)`**
- Validates subreddit name format
- Checks length (3-21 characters)
- Ensures alphanumeric + underscore only

## Troubleshooting

### "Reddit credentials not configured"
- Ensure REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET are set in Supabase secrets
- Check the secrets are not empty or have extra whitespace

### "Subreddit not found or is private"
- Verify the subreddit name is correct (no r/ prefix)
- Check if the subreddit exists on Reddit
- Some subreddits are private and can't be monitored

### "No relevant items found"
- Your project description might be too generic
- Try adding more specific keywords
- The subreddit might not have recent relevant content
- Lower the relevance threshold in your code

### Feed is empty after scanning
- Check the date range (free tier doesn't support historical scanning)
- Verify subreddits have recent posts
- Review project description keywords
- Check server logs for errors

## Future Enhancements

Potential improvements to consider:
- User OAuth for posting directly to Reddit
- Direct message monitoring
- Comment reply notifications
- Sentiment analysis
- Trending topic detection
- Automated response posting (with approval)
- Webhook notifications for high-relevance items
- Multi-language support

## Support

For issues with Reddit integration:
1. Check server logs in Supabase Edge Functions
2. Verify Reddit API credentials
3. Test subreddit accessibility manually on Reddit
4. Review relevance scoring in your project description
5. Contact support with specific error messages

## Resources

- [Reddit API Documentation](https://www.reddit.com/dev/api/)
- [Reddit OAuth2 Guide](https://github.com/reddit-archive/reddit/wiki/OAuth2)
- [Subreddit Rules](https://www.reddithelp.com/hc/en-us/articles/205926439)
- [Reddit Self-Promotion Guidelines](https://www.reddit.com/wiki/selfpromotion)
