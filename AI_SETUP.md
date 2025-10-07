# AI Features Setup Guide

PubHub uses **Azure OpenAI with GPT-5-mini** for AI-powered features including chat assistance and content transformation.

## Prerequisites

1. **Azure OpenAI Service**: An Azure subscription with OpenAI service enabled
2. **Deployed Model**: GPT-5-mini deployment in your Azure OpenAI resource

## Architecture

PubHub uses a **client-server architecture** for AI features:
- **Frontend (Vite/React)**: Makes requests to backend API
- **Backend API (Hono)**: Handles AI requests using Azure OpenAI SDK
- **Azure OpenAI**: Provides GPT-5-mini model for AI features

This architecture ensures:
- Secure API key management (keys never exposed to browser)
- No CORS issues with Azure OpenAI
- Enterprise-grade reliability and performance
- Simplified authentication

## Setup Steps

### 1. Set Up Azure OpenAI

1. Go to [Azure Portal](https://portal.azure.com)
2. Create an **Azure OpenAI** resource (if you don't have one)
3. Navigate to your Azure OpenAI resource
4. Go to **Keys and Endpoint** section
5. Copy your **API Key** and **Endpoint URL**
6. Go to **Model deployments**
7. Deploy the **gpt-5-mini** model (note the deployment name)

### 2. Configure Environment Variables

Create or update `.env.local` with your Azure OpenAI credentials:

```bash
# Azure OpenAI Configuration (Required)
AZURE_ENDPOINT=https://your-resource-name.openai.azure.com/openai/deployments/gpt-5-mini/chat/completions?api-version=2024-08-01-preview
AZURE_API_KEY=your-azure-api-key
```

**Note**: Replace `your-resource-name` with your actual Azure OpenAI resource name and use your actual API key.

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

### 4. Azure OpenAI Benefits

Azure OpenAI provides:
- **Enterprise-grade reliability**: 99.9% SLA for production workloads
- **Security and compliance**: SOC 2, HIPAA, and other compliance certifications
- **Data privacy**: Your data stays in your Azure region and is not used for training
- **Scalability**: Auto-scaling to handle varying workloads
- **Advanced models**: Access to latest GPT models including GPT-5-mini
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

**Cause**: Azure OpenAI credentials not configured or invalid

**Solution**:
1. Verify `AZURE_ENDPOINT` and `AZURE_API_KEY` are set in `.env.local`
2. Check that the API key is valid from your Azure OpenAI resource
3. Ensure your Azure OpenAI resource has the gpt-5-mini model deployed
4. Restart the backend server (`npm run dev:server`) after updating `.env.local`

### "AI transformation failed"

**Cause**: API quota exceeded, network issues, or Azure configuration

**Solution**:
1. Check your Azure OpenAI quota in the Azure Portal
2. Verify network connectivity to Azure
3. Check browser console and backend server logs for detailed error messages
4. Ensure your deployment name matches `gpt-5-mini`
5. Content will fall back to template-based generation if AI fails

### Rate limiting

**Cause**: Too many API requests exceeding Azure quota

**Solution**:
1. Check your Azure OpenAI quota limits in the Azure Portal
2. Monitor usage in Azure Monitor or Application Insights
3. Request quota increase from Azure Support if needed
4. Implement client-side request throttling if necessary

## Best Practices

1. **Monitor Azure costs** regularly in the Azure Portal to avoid unexpected charges
2. **Set appropriate response parameters** to manage costs and response times
3. **Implement error handling** for graceful degradation to template-based content
4. **Monitor API usage** in Azure Monitor
5. **Use temperature wisely**: 0.5-0.7 for consistent results, 0.8-0.9 for creative content
6. **Enable Application Insights** for detailed logging and diagnostics
7. **Set up alerts** for quota limits and unusual usage patterns

## Cost Optimization

### Azure OpenAI Pricing

Azure OpenAI charges based on:
- **Token usage**: Per 1000 tokens (input and output)
- **Model tier**: GPT-5-mini is cost-effective for most use cases
- **Data processing**: Data in/out charges apply

### Reducing Costs

1. **Monitor token usage** in Azure Cost Management
2. **Optimize prompts** to reduce unnecessary tokens
3. **Use template fallbacks** when AI is not critical
4. **Set quota limits** in Azure to prevent runaway costs
5. **Implement caching** on the backend for repeated requests

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
