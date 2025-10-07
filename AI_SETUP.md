# AI Features Setup Guide

PubHub uses **Google Gemini 2.5 Flash-Lite** via **Vercel AI Gateway** for AI-powered features including chat assistance and content transformation.

## Prerequisites

1. **Google AI API Key**: Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. **Vercel AI Gateway** (Optional but Recommended): Set up at [Vercel AI Gateway](https://vercel.com/docs/ai-gateway)

## Setup Steps

### 1. Get Google AI API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API key"** or **"Create API key"**
4. Copy the generated API key

### 2. Configure Environment Variables

Create or update `.env.local` with your API keys:

```bash
# Google Gemini API Key (Required)
VITE_GOOGLE_GENERATIVE_AI_API_KEY=your-google-api-key-here

# Vercel AI Gateway URL (Optional - for advanced features)
VITE_AI_GATEWAY_URL=https://gateway.ai.cloudflare.com/v1/<account_id>/<gateway_name>/google-ai-studio/v1beta
```

### 3. Vercel AI Gateway Setup (Optional)

For production deployments, using Vercel AI Gateway provides:
- Request caching
- Rate limiting
- Analytics and monitoring
- Cost optimization

**Setup Instructions:**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **AI** → **Gateway**
3. Create a new gateway
4. Configure it for Google AI Studio
5. Copy the gateway URL
6. Update `VITE_AI_GATEWAY_URL` in `.env.local`

**Gateway URL Format:**
```
https://gateway.ai.cloudflare.com/v1/<account_id>/<gateway_name>/google-ai-studio/v1beta
```

Replace:
- `<account_id>`: Your Cloudflare/Vercel account ID
- `<gateway_name>`: Your chosen gateway name

### 4. Testing the Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the application in your browser

3. Click the **AI chat icon** in the header

4. Send a test message like "Hello, can you help me?"

5. If configured correctly, you should receive an AI-powered response

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

**Cause**: API key not configured or invalid

**Solution**:
1. Verify `VITE_GOOGLE_GENERATIVE_AI_API_KEY` is set in `.env.local`
2. Check that the API key is valid and active
3. Restart the development server after updating `.env.local`

### "AI transformation failed"

**Cause**: API quota exceeded or network issues

**Solution**:
1. Check your Google AI Studio quota
2. Verify network connectivity
3. Check browser console for detailed error messages
4. Content will fall back to template-based generation

### Gateway URL errors

**Cause**: Incorrect gateway URL format

**Solution**:
1. Verify the gateway URL format matches the pattern
2. Ensure all placeholders are replaced with actual values
3. Test without gateway URL first (comment it out temporarily)

### Rate limiting

**Cause**: Too many API requests

**Solution**:
1. Implement Vercel AI Gateway for caching
2. Add request throttling in your code
3. Upgrade your Google AI API tier

## Best Practices

1. **Use AI Gateway in production** for better performance and cost control
2. **Set appropriate token limits** to manage costs
3. **Implement error handling** for graceful degradation
4. **Monitor API usage** in Google AI Studio dashboard
5. **Cache frequently requested content** to reduce API calls
6. **Use lower temperature** (0.5-0.7) for consistent results
7. **Use higher temperature** (0.8-0.9) for creative content

## Cost Optimization

### Free Tier Limits

Google Gemini free tier includes:
- 60 requests per minute
- 1,500 requests per day
- Rate limits may vary by model

### Reducing Costs

1. **Use Flash models** instead of Pro for routine tasks
2. **Implement caching** with Vercel AI Gateway
3. **Set reasonable maxTokens** limits
4. **Use template fallbacks** when AI is not critical
5. **Monitor usage** regularly

## Security

### API Key Protection

- **Never commit** API keys to version control
- **Use environment variables** for all sensitive data
- **Rotate keys regularly** for production apps
- **Use different keys** for dev/staging/prod

### User Data

- AI requests may include user content
- Review [Google AI Studio Terms](https://ai.google.dev/terms)
- Consider implementing server-side proxy for sensitive data

## Additional Resources

- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Google AI Studio](https://aistudio.google.com/)
- [Vercel AI Gateway Docs](https://vercel.com/docs/ai-gateway)
- [Gemini API Documentation](https://ai.google.dev/docs)

## Support

For issues or questions:
- Check the troubleshooting section above
- Review browser console for error messages
- Verify API key and environment configuration
- Check [Google AI Studio status](https://status.cloud.google.com/)
