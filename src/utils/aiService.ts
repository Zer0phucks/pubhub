// AI Service using Vercel AI Gateway with Google Gemini 2.5 Flash-Lite
import { generateText, streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

// Configure Google Gemini through Vercel AI Gateway
const getAIModel = () => {
  const gatewayKey = import.meta.env.VITE_AI_GATEWAY_API_KEY;

  if (!gatewayKey) {
    console.warn('Vercel AI Gateway API key not configured. AI features will be disabled.');
    return null;
  }

  // Create Google provider with Vercel AI Gateway
  const google = createGoogleGenerativeAI({
    apiKey: gatewayKey,
    baseURL: 'https://ai-gateway.vercel.sh/v1/providers/google',
  });

  // Using Gemini 2.5 Flash-Lite Preview model (fast and efficient)
  return google('gemini-2.5-flash-lite-preview-09-2025');
};

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are PubHub AI, a helpful content creation assistant for social media creators.
You help users with:
- Content strategy and ideas
- Analytics interpretation
- Scheduling recommendations
- Platform-specific best practices
- Engagement optimization
- Content repurposing

Provide concise, actionable advice. Be friendly and encouraging.`;

// Generate AI chat response
export async function generateChatResponse(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  context?: {
    currentView?: string;
    platform?: string;
    userData?: any;
  }
): Promise<string> {
  const model = getAIModel();

  if (!model) {
    return "AI features are currently unavailable. Please configure your Google AI API key.";
  }

  try {
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
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      temperature: 0.7,
      maxTokens: 500,
    });

    return result.text;
  } catch (error) {
    console.error('AI chat error:', error);
    return "I'm having trouble processing that request. Please try again.";
  }
}

// Stream AI chat response (for real-time streaming)
export async function streamChatResponse(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  context?: {
    currentView?: string;
    platform?: string;
    userData?: any;
  }
) {
  const model = getAIModel();

  if (!model) {
    throw new Error("AI features are currently unavailable. Please configure your Google AI API key.");
  }

  // Add context to the system message
  let systemMessage = SYSTEM_PROMPT;
  if (context) {
    systemMessage += `\n\nCurrent context:`;
    if (context.currentView) systemMessage += `\n- User is viewing: ${context.currentView}`;
    if (context.platform) systemMessage += `\n- Selected platform: ${context.platform}`;
  }

  const result = await streamText({
    model,
    system: systemMessage,
    messages: messages.map(m => ({
      role: m.role,
      content: m.content,
    })),
    temperature: 0.7,
    maxTokens: 500,
  });

  return result.textStream;
}

// Transform content using AI
export async function transformContent(
  sourceContent: string,
  transformationType: string,
  customInstructions?: string
): Promise<string> {
  const model = getAIModel();

  if (!model) {
    return "AI transformation unavailable. Please configure your Google AI API key.";
  }

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

  try {
    const result = await generateText({
      model,
      prompt,
      temperature: 0.8,
      maxTokens: 1500,
    });

    return result.text;
  } catch (error) {
    console.error('AI transformation error:', error);
    return "Failed to transform content. Please try again.";
  }
}

// Generate content ideas
export async function generateContentIdeas(
  topic: string,
  platform: string,
  count: number = 5
): Promise<string[]> {
  const model = getAIModel();

  if (!model) {
    return ["AI features unavailable. Please configure your API key."];
  }

  const prompt = `Generate ${count} creative content ideas for ${platform} about ${topic}.
Each idea should be engaging and platform-appropriate.
Format: Return a numbered list.`;

  try {
    const result = await generateText({
      model,
      prompt,
      temperature: 0.9,
      maxTokens: 400,
    });

    // Parse the response into an array
    return result.text
      .split('\n')
      .filter(line => line.trim().match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim());
  } catch (error) {
    console.error('AI content ideas error:', error);
    return ["Failed to generate ideas. Please try again."];
  }
}

// Optimize content for platform
export async function optimizeForPlatform(
  content: string,
  platform: string
): Promise<string> {
  const model = getAIModel();

  if (!model) {
    return content;
  }

  const platformGuidelines: Record<string, string> = {
    twitter: 'Optimize for Twitter: Keep it concise (280 chars), add engaging hooks, use relevant hashtags.',
    instagram: 'Optimize for Instagram: Add engaging captions, relevant hashtags, and emojis. Focus on visual storytelling.',
    linkedin: 'Optimize for LinkedIn: Professional tone, thought leadership, industry insights, clear value proposition.',
    facebook: 'Optimize for Facebook: Conversational tone, community engagement, questions to spark discussion.',
    tiktok: 'Optimize for TikTok: Trendy, short-form, engaging hooks, relevant hashtags.',
  };

  const guideline = platformGuidelines[platform] || 'Optimize this content for the target platform.';
  const prompt = `${guideline}\n\nOriginal content:\n${content}`;

  try {
    const result = await generateText({
      model,
      prompt,
      temperature: 0.7,
      maxTokens: 500,
    });

    return result.text;
  } catch (error) {
    console.error('AI optimization error:', error);
    return content;
  }
}
