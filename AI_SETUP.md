# AI Features Setup Guide

PubHub uses **Google Gemini 2.5 Flash-Lite** via **Vercel AI Gateway** for AI-powered features including chat assistance and content transformation.

## Prerequisites

1. **Vercel AI Gateway API Key**: Get your API key from [Vercel Dashboard](https://vercel.com/dashboard)

## Architecture

PubHub uses a **client-server architecture** for AI features:
- **Frontend (Vite/React)**: Makes requests to backend API
- **Backend API (Hono)**: Handles AI requests using Vercel AI Gateway
- **Vercel AI Gateway**: Proxies requests to Google Gemini with caching and optimization

This architecture ensures:
- Secure API key management (keys never exposed to browser)
- No CORS issues with AI Gateway
- Better caching and rate limiting
- Simplified authentication

## Setup Steps

### 1. Get Vercel AI Gateway API Key

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **AI** → **Gateway**
3. Create a new gateway or use an existing one
4. Configure it for **Google AI Studio**
5. Copy the gateway API key (starts with `vck_`)

### 2. Configure Environment Variables

Create or update `.env.local` with your Vercel AI Gateway API key:

```bash
# Vercel AI Gateway API Key (Required)
VITE_AI_GATEWAY_API_KEY=your-vercel-ai-gateway-key
```

**Note**: You do NOT need a separate Google AI API key. The Vercel AI Gateway handles authentication with Google AI Studio.

### 3. Start Both Servers

Run both the frontend and backend together:

```bash
# Start both servers with concurrently (recommended)
npm run dev:all

# Or start them separately in different terminals:
# Terminal 1 - Frontend (port 5173/3000)
npm run dev

# Terminal 2 - Backend API (port 3001)
npm run dev:server
```

**Note**: `npm run dev:all` uses `concurrently` to run both servers in a single terminal window.

### 4. Vercel AI Gateway Benefits

Vercel AI Gateway provides:
- **Request caching**: Reduce API calls and improve response times
- **Rate limiting**: Automatic throttling to prevent quota exhaustion
- **Analytics and monitoring**: Track AI usage and performance
- **Cost optimization**: Caching reduces billable API calls
- **Simplified authentication**: One API key instead of managing multiple provider keys
- **No CORS issues**: Server-side usage eliminates browser security restrictions

### 5. Testing the Setup

1. Ensure both servers are running (frontend on port 5173, backend on port 3001)

2. Open the application in your browser at http://localhost:5173

3. Click the **AI chat icon** in the header

4. Send a test message like "Hello, can you help me?"

5. If configured correctly, you should receive an AI-powered response

6. Check the browser console and backend server logs for any errors

## AI Features

### 1. AI Chat Assistant

**Location**: Available via the sparkle icon in the app header

**Capabilities**:
- Context-aware responses based on current view and platform
- Content strategy suggestions
- Analytics interpretation
- Scheduling recommendations
- Platform-specific best practices

**Usage**:
1. Click the AI icon in the header
2. Type your question or request
3. Receive AI-powered assistance

### 2. Content Transformation

**Location**: Media Library → Transform Video

**Capabilities**:
- Transform video content into blog posts
- Generate social media threads
- Create LinkedIn articles
- Generate platform announcements
- Create email newsletters
- Generate platform-specific captions

**Usage**:
1. Navigate to Media Library
2. Select a video
3. Click **Transform**
4. Choose transformation type
5. AI generates optimized content

### 3. Content Optimization

**Capabilities**:
- Platform-specific content optimization
- Hashtag recommendations
- Engagement optimization
- Content idea generation

## Configuration Options

### Model Selection

The default model is **Gemini 2.5 Flash-Lite Preview** for fast, cost-effective responses.

To use a different Gemini model, edit `src/utils/aiService.ts`:

```typescript
// Change from:
return google('gemini-2.5-flash-lite-preview-09-2025', config);

// To (for example):
return google('gemini-1.5-pro', config);
```

Available models:
- `gemini-2.5-flash-lite-preview-09-2025` - Fast and efficient (default)
- `gemini-1.5-flash` - Balanced performance
- `gemini-1.5-pro` - Most capable, best for complex tasks
- `gemini-2.0-flash-exp` - Experimental, latest features

### Temperature & Creativity

Adjust AI creativity in `src/utils/aiService.ts`:

```typescript
// Lower temperature (0.3-0.5) = More focused, consistent
// Higher temperature (0.7-0.9) = More creative, varied

temperature: 0.7, // Default value
```

### Token Limits

Adjust response length in `src/utils/aiService.ts`:

```typescript
maxTokens: 500, // Default for chat
maxTokens: 1500, // Default for transformations
```

## Troubleshooting

### "AI features are currently unavailable"

**Cause**: Vercel AI Gateway API key not configured or invalid

**Solution**:
1. Verify `VITE_AI_GATEWAY_API_KEY` is set in `.env.local`
2. Check that the API key is valid and starts with `vck_`
3. Ensure your Vercel AI Gateway is configured for Google AI Studio
4. Restart the development server after updating `.env.local`

### "AI transformation failed"

**Cause**: API quota exceeded, network issues, or gateway misconfiguration

**Solution**:
1. Check your Vercel AI Gateway dashboard for quota and usage
2. Verify network connectivity
3. Check browser console for detailed error messages
4. Ensure your gateway is properly configured for Google AI Studio
5. Content will fall back to template-based generation if AI fails

### Rate limiting

**Cause**: Too many API requests

**Solution**:
1. Vercel AI Gateway automatically handles rate limiting and caching
2. Monitor your usage in the Vercel AI Gateway dashboard
3. Adjust your gateway configuration if needed
4. Upgrade your Vercel plan for higher limits if required

## Best Practices

1. **Use Vercel AI Gateway** for all AI features (better performance, cost control, and caching)
2. **Set appropriate token limits** to manage costs and response times
3. **Implement error handling** for graceful degradation to template-based content
4. **Monitor API usage** in Vercel AI Gateway dashboard
5. **Leverage automatic caching** provided by the gateway
6. **Use lower temperature** (0.5-0.7) for consistent, focused results
7. **Use higher temperature** (0.8-0.9) for creative, varied content

## Cost Optimization

### Gateway Benefits

Vercel AI Gateway provides automatic cost optimization through:
- **Request caching**: Reduces duplicate API calls
- **Rate limiting**: Prevents quota exhaustion
- **Usage analytics**: Track and optimize spending
- **Unified billing**: Single invoice for all AI providers

### Reducing Costs

1. **Leverage gateway caching** for frequently requested content
2. **Set reasonable maxTokens** limits (500 for chat, 1500 for transformations)
3. **Use template fallbacks** when AI is not critical
4. **Monitor usage** regularly in Vercel dashboard
5. **Optimize prompts** to reduce token usage

## Security

### API Key Protection

- **Never commit** API keys to version control
- **Use environment variables** (with `VITE_` prefix for Vite apps) for all sensitive data
- **Rotate keys regularly** for production apps
- **Use different gateway keys** for dev/staging/prod environments

### User Data

- AI requests go through Vercel AI Gateway before reaching Google AI
- Review [Vercel AI Gateway Privacy](https://vercel.com/docs/ai-gateway/privacy)
- Review [Google AI Studio Terms](https://ai.google.dev/terms)
- Consider implementing server-side proxy for highly sensitive data

## Additional Resources

- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Vercel AI Gateway Docs](https://vercel.com/docs/ai-gateway)
- [Vercel AI Gateway Dashboard](https://vercel.com/dashboard) (AI → Gateway)
- [Google Gemini Models](https://ai.google.dev/gemini-api/docs/models)
- [Gemini API Documentation](https://ai.google.dev/docs)

## Support

For issues or questions:
- Check the troubleshooting section above
- Review browser console for error messages
- Verify API key and environment configuration
- Check [Google AI Studio status](https://status.cloud.google.com/)
