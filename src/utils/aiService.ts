// AI Service - Frontend client for backend AI API
// Calls backend API which uses Vercel AI Gateway with Google Gemini 2.5 Flash-Lite

const API_BASE_URL = 'http://localhost:3001/api/ai';

// Generate AI chat response
export async function generateChatResponse(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  context?: {
    currentView?: string;
    platform?: string;
    userData?: any;
  }
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages, context }),
    });

    if (!response.ok) {
      throw new Error('AI API request failed');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('AI chat error:', error);
    return "I'm having trouble processing that request. Please try again.";
  }
}

// Stream AI chat response (for real-time streaming)
// Note: Streaming not implemented in backend yet, falls back to regular response
export async function streamChatResponse(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  context?: {
    currentView?: string;
    platform?: string;
    userData?: any;
  }
) {
  // For now, use the regular chat endpoint
  const response = await generateChatResponse(messages, context);
  return response;
}

// Transform content using AI
export async function transformContent(
  sourceContent: string,
  transformationType: string,
  customInstructions?: string
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/transform`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceContent,
        transformationType,
        customInstructions,
      }),
    });

    if (!response.ok) {
      throw new Error('AI transformation request failed');
    }

    const data = await response.json();
    return data.transformedContent;
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
  try {
    const response = await fetch(`${API_BASE_URL}/ideas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic, platform, count }),
    });

    if (!response.ok) {
      throw new Error('AI ideas request failed');
    }

    const data = await response.json();
    return data.ideas;
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
  try {
    const response = await fetch(`${API_BASE_URL}/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, platform }),
    });

    if (!response.ok) {
      throw new Error('AI optimization request failed');
    }

    const data = await response.json();
    return data.optimizedContent;
  } catch (error) {
    console.error('AI optimization error:', error);
    return content;
  }
}
