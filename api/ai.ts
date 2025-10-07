// AI API endpoint using Vercel AI Gateway (server-side)
import { Hono } from 'hono';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const app = new Hono();

// Configure Google Gemini through Vercel AI Gateway
const getAIModel = () => {
  const gatewayKey = process.env.VITE_AI_GATEWAY_API_KEY;

  if (!gatewayKey) {
    throw new Error('Vercel AI Gateway API key not configured');
  }

  // Create Google provider with Vercel AI Gateway
  const google = createGoogleGenerativeAI({
    apiKey: gatewayKey,
    baseURL: 'https://ai-gateway.vercel.sh/v1/providers/google',
  });

  return google('gemini-2.5-flash-lite-preview-09-2025');
};

const SYSTEM_PROMPT = `You are PubHub AI, a helpful content creation assistant for social media creators.
You help users with:
- Content strategy and ideas
- Analytics interpretation
- Scheduling recommendations
- Platform-specific best practices
- Engagement optimization
- Content repurposing

Provide concise, actionable advice. Be friendly and encouraging.`;

// POST /api/ai/chat - Generate AI chat response
app.post('/chat', async (c) => {
  try {
    const { messages, context } = await c.req.json();

    const model = getAIModel();

    // Add context to the system message
    let systemMessage = SYSTEM_PROMPT;
    if (context) {
      systemMessage += `\n\nCurrent context:`;
      if (context.currentView) systemMessage += `\n- User is viewing: ${context.currentView}`;
      if (context.platform) systemMessage += `\n- Selected platform: ${context.platform}`;
    }

    const result = await generateText({
      model,
      system: systemMessage,
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: 0.7,
      maxRetries: 2,
    });

    return c.json({ response: result.text });
  } catch (error) {
    console.error('AI chat error:', error);
    return c.json(
      { error: "I'm having trouble processing that request. Please try again." },
      500
    );
  }
});

// POST /api/ai/transform - Transform content using AI
app.post('/transform', async (c) => {
  try {
    const { sourceContent, transformationType, customInstructions } = await c.req.json();

    const model = getAIModel();

    const transformationPrompts: Record<string, string> = {
      'blog': 'Transform this content into a comprehensive blog post with headers, paragraphs, and a conclusion.',
      'social-thread': 'Transform this content into an engaging Twitter/X thread with numbered tweets. Keep each tweet under 280 characters.',
      'linkedin-post': 'Transform this content into a professional LinkedIn post with insights and key takeaways.',
      'social-announcement': 'Create engaging social media announcements for Twitter, LinkedIn, Facebook, and Instagram.',
      'newsletter': 'Transform this content into an email newsletter with subject line, sections, and call-to-action.',
      'captions': 'Create platform-specific captions for Instagram, TikTok, and Facebook with relevant hashtags.',
    };

    const basePrompt = transformationPrompts[transformationType] || 'Transform this content appropriately.';
    const prompt = customInstructions
      ? `${basePrompt}\n\nCustom instructions: ${customInstructions}\n\nContent:\n${sourceContent}`
      : `${basePrompt}\n\nContent:\n${sourceContent}`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.8,
      maxRetries: 2,
    });

    return c.json({ transformedContent: result.text });
  } catch (error) {
    console.error('AI transformation error:', error);
    return c.json(
      { error: 'Failed to transform content. Please try again.' },
      500
    );
  }
});

// POST /api/ai/ideas - Generate content ideas
app.post('/ideas', async (c) => {
  try {
    const { topic, platform, count = 5 } = await c.req.json();

    const model = getAIModel();

    const prompt = `Generate ${count} creative content ideas for ${platform} about ${topic}.
Each idea should be engaging and platform-appropriate.
Format: Return a numbered list.`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.9,
      maxRetries: 2,
    });

    // Parse the response into an array
    const ideas = result.text
      .split('\n')
      .filter(line => line.trim().match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim());

    return c.json({ ideas });
  } catch (error) {
    console.error('AI content ideas error:', error);
    return c.json(
      { error: 'Failed to generate ideas. Please try again.' },
      500
    );
  }
});

// POST /api/ai/optimize - Optimize content for platform
app.post('/optimize', async (c) => {
  try {
    const { content, platform } = await c.req.json();

    const model = getAIModel();

    const platformGuidelines: Record<string, string> = {
      twitter: 'Optimize for Twitter: Keep it concise (280 chars), add engaging hooks, use relevant hashtags.',
      instagram: 'Optimize for Instagram: Add engaging captions, relevant hashtags, and emojis. Focus on visual storytelling.',
      linkedin: 'Optimize for LinkedIn: Professional tone, thought leadership, industry insights, clear value proposition.',
      facebook: 'Optimize for Facebook: Conversational tone, community engagement, questions to spark discussion.',
      tiktok: 'Optimize for TikTok: Trendy, short-form, engaging hooks, relevant hashtags.',
    };

    const guideline = platformGuidelines[platform] || 'Optimize this content for the target platform.';
    const prompt = `${guideline}\n\nOriginal content:\n${content}`;

    const result = await generateText({
      model,
      prompt,
      temperature: 0.7,
      maxRetries: 2,
    });

    return c.json({ optimizedContent: result.text });
  } catch (error) {
    console.error('AI optimization error:', error);
    return c.json({ optimizedContent: content }, 200); // Return original on error
  }
});

export default app;
