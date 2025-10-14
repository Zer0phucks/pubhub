# Azure OpenAI Integration - Complete Setup Guide

## ✅ Status: FULLY CONFIGURED AND OPERATIONAL

Your Azure OpenAI integration is **already set up and working**! This document explains how it's configured and how to use it.

## Current Configuration

### Environment Variables (Already Set)
- ✅ `AZURE_OPENAI_API_KEY` - Your Azure OpenAI API key
- ✅ `AZURE_OPENAI_ENDPOINT` - Your Azure OpenAI endpoint URL

These credentials are stored securely in Supabase environment variables and are ready to use.

## What Azure OpenAI Powers

PubHub uses Azure OpenAI (GPT-4-mini) for these features:

### 1. **Subreddit Suggestions** ✅
When you create a project, AI analyzes your app description and suggests 8-10 relevant subreddits where you can engage with potential users.

**How it works:**
- Extracts key features from your app description
- Identifies target audience and use cases
- Suggests active, engaged communities
- Prioritizes niche communities over spam-heavy ones

**Example:**
```
Input: "AI-powered task management tool for developers"
Output: ["webdev", "programming", "SaaS", "productivity", "coding", "webdesign", "startups", "entrepreneur"]
```

### 2. **AI-Generated Responses** ✅
For every relevant Reddit post or comment in your feed, AI generates an authentic, helpful response based on your project's AI persona.

**How it works:**
- Analyzes the Reddit post/comment context
- Uses your custom AI persona (configured in Project Settings)
- Generates conversational, value-adding responses
- Keeps responses under 200 words
- Avoids promotional or spammy language

**Features:**
- Customizable tone via AI persona
- Context-aware responses
- Reddit-appropriate language
- Genuine and helpful, not salesy

### 3. **Post Generation** ✅
Create Reddit posts with AI assistance for any of your monitored subreddits.

**Two modes:**
1. **Generate from scratch**: Provide a topic/guidance, AI creates a full post
2. **Enhance existing**: Provide your draft, AI improves it for Reddit

**How it works:**
- Understands subreddit culture
- Includes discussion hooks
- Adds value (tips, insights, stories)
- Mentions your app naturally when relevant
- Avoids over-promotion

### 4. **Post Ideas** ✅
Get 3 specific, actionable post ideas for your project.

**Output:**
- Specific topics, not generic templates
- Tied to your app's unique value proposition
- Designed to spark discussion
- Provides genuine value to communities

## Enhanced Features (New in v2)

I've created an enhanced OpenAI module with additional capabilities:

### 1. **Advanced Prompt Templates**
Professional, tested prompts for each use case with better guardrails and instructions.

### 2. **Rate Limiting**
Protects your API quota:
- 20 requests per minute per user
- Prevents abuse
- Automatic throttling

### 3. **Spam Detection**
Automatically flags AI-generated content that seems promotional:
- Checks for spam indicators
- Warns if response is too salesy
- Helps maintain authenticity

### 4. **Response Sanitization**
Cleans up AI output:
- Removes markdown code blocks
- Strips common AI disclaimers ("Here's a response...")
- Trims whitespace
- Ensures clean, natural responses

### 5. **Safe JSON Parsing**
Handles malformed JSON responses gracefully:
- Extracts JSON from markdown code blocks
- Provides fallbacks
- Prevents app crashes from bad AI output

### 6. **Enhanced Error Handling**
Better error messages and logging:
- Detailed error context
- Helps debug issues
- User-friendly error messages

## Usage in Your App

### Frontend → Backend Flow

1. **User Action**: User clicks "Get Suggestions", "Generate Response", or "Create Post"
2. **API Call**: Frontend calls backend endpoint (e.g., `/suggest-subreddits`)
3. **Authentication**: Backend verifies Clerk JWT token
4. **Rate Limiting**: Checks if user is within rate limits
5. **AI Generation**: Calls Azure OpenAI with optimized prompts
6. **Response Processing**: Sanitizes and validates AI output
7. **Storage**: Saves result to KV store (for responses)
8. **Return**: Sends clean result back to frontend

### Example: Generating a Response

```typescript
// Frontend
const response = await api.generateResponse(projectId, feedItemId, postContent);

// Backend processes:
// 1. Authenticates user
// 2. Loads project data and AI persona
// 3. Builds context-aware prompt
// 4. Calls Azure OpenAI
// 5. Sanitizes response
// 6. Checks for spam
// 7. Saves to feed item
// 8. Returns to frontend

// User sees the response in the feed item
```

## API Endpoints Using Azure OpenAI

### 1. `POST /suggest-subreddits`
```json
Request: {
  "description": "Your app description",
  "url": "https://yourapp.com"
}

Response: {
  "subreddits": ["webdev", "SaaS", ...]
}
```

### 2. `POST /generate-response`
```json
Request: {
  "projectId": "uuid",
  "feedItemId": "uuid",
  "postContent": "Reddit post text"
}

Response: {
  "response": "Generated response text"
}
```

### 3. `POST /generate-post`
```json
Request: {
  "projectId": "uuid",
  "subreddit": "webdev",
  "userPrompt": "Share our new feature",
  "enhance": false
}

Response: {
  "post": "Generated post text"
}
```

### 4. `POST /suggest-posts`
```json
Request: {
  "projectId": "uuid"
}

Response: {
  "suggestions": [
    "Post idea 1",
    "Post idea 2",
    "Post idea 3"
  ]
}
```

## Configuration Options

### Temperature
Controls randomness (0-1):
- **0.7** (default): Balanced creativity and consistency
- **0.8**: More creative for subreddit suggestions
- **0.5**: More focused for responses

### Max Tokens
Controls response length:
- **300 tokens**: Subreddit suggestions
- **800 tokens**: Post generation
- **500 tokens**: Response generation

### System Prompts
Each project has a customizable AI persona:
```
Default: "You are a helpful and friendly app developer responding to potential users on Reddit."

Custom: "You are a technical expert who provides detailed, code-focused solutions."
```

## Best Practices

### 1. **Customize AI Persona**
In Project Settings, define your AI's personality:
- Professional vs. casual
- Technical vs. simple
- Formal vs. friendly
- Helpful vs. promotional (prefer helpful!)

### 2. **Review Before Posting**
Always review AI-generated content:
- Check for accuracy
- Ensure it matches subreddit culture
- Verify it's not too promotional
- Add personal touches

### 3. **Monitor Quality**
If responses aren't good:
- Improve your AI persona description
- Make project description more detailed
- Provide better context in prompts

### 4. **Stay Authentic**
- Edit AI responses to add personality
- Share real experiences
- Be honest about your app
- Focus on helping, not selling

## Troubleshooting

### "Azure OpenAI credentials not configured"
**Cause**: Environment variables not set  
**Solution**: The credentials are already configured! If you see this, contact support.

### "Rate limit exceeded"
**Cause**: Too many AI requests in short time  
**Solution**: Wait 1 minute, then try again. This protects your API quota.

### "Invalid response format"
**Cause**: AI returned unexpected format  
**Solution**: This is handled automatically with fallbacks. Report if it persists.

### Responses seem promotional/spammy
**Cause**: AI persona too sales-focused  
**Solution**: 
1. Update AI persona to be more helpful and less promotional
2. Add guidelines like "Focus on providing value, not promoting"
3. Always edit responses before posting

### Subreddit suggestions not relevant
**Cause**: Project description too vague  
**Solution**: Make your project description more specific:
- Include target audience
- Mention key features
- Describe problems you solve
- Add use cases

## Cost Management

Azure OpenAI charges per token. Your current configuration is cost-effective:

**Typical Costs:**
- Subreddit suggestion: ~200 tokens (input + output)
- Response generation: ~400 tokens
- Post generation: ~500 tokens

**Monthly estimates** (based on GPT-4-mini pricing):
- Light use (50 requests/day): ~$5-10/month
- Medium use (200 requests/day): ~$20-40/month
- Heavy use (500 requests/day): ~$50-100/month

**Optimization tips:**
1. Use rate limiting (already implemented)
2. Cache subreddit suggestions (don't regenerate for same description)
3. Only generate responses when needed
4. Review and reuse good responses as templates

## Advanced Features (Optional)

### Streaming Responses
For real-time response generation, you can implement streaming:
```typescript
// Example of potential streaming implementation
const stream = await openai.streamCompletion(messages);
for await (const chunk of stream) {
  // Update UI with partial response
}
```

### Function Calling
Use AI to decide actions:
- Determine if response is needed
- Choose best subreddit for post
- Classify engagement priority

### Embeddings
Future enhancement for better relevance:
- Semantic search of Reddit posts
- Find similar discussions
- Cluster related topics

## Security

✅ **API Keys Protected**:
- Stored in Supabase secrets
- Never exposed to frontend
- Encrypted at rest

✅ **Authentication Required**:
- All AI endpoints require valid Clerk token
- User-scoped rate limiting
- Audit logging

✅ **Content Filtering**:
- Spam detection
- Response sanitization
- User approval workflow

## Monitoring

Track AI usage:
1. Check Supabase Edge Function logs
2. Monitor Azure OpenAI usage dashboard
3. Watch for error rates
4. Review response quality

**Logs location**: Supabase Dashboard → Edge Functions → make-server-dc1f2437

## Support

If you need help with Azure OpenAI:
1. Check server logs in Supabase
2. Verify endpoint URL format is correct
3. Test API key in Azure portal
4. Check quota limits in Azure dashboard
5. Review error messages in browser console

## Next Steps

Your Azure OpenAI integration is ready! Try:
1. ✅ Create a project → Get AI subreddit suggestions
2. ✅ Add subreddits → Scan for relevant posts
3. ✅ Click "Generate Response" on a feed item
4. ✅ Create a post with AI assistance
5. ✅ Customize your AI persona in settings

Everything is configured and working. Start engaging with your Reddit community!

## Additional Resources

- [Azure OpenAI Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- [GPT-4 Best Practices](https://platform.openai.com/docs/guides/gpt-best-practices)
- [Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [Azure OpenAI Pricing](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/openai-service/)
