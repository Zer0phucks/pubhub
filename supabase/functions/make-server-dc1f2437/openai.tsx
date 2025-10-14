// Azure OpenAI Integration Module

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

// Call Azure OpenAI with enhanced error handling
export async function callAzureOpenAI(
  messages: OpenAIMessage[],
  systemPrompt?: string,
  config: OpenAIConfig = {}
): Promise<string> {
  const endpoint = Deno.env.get('AZURE_OPENAI_ENDPOINT');
  const apiKey = Deno.env.get('AZURE_OPENAI_API_KEY');

  if (!endpoint || !apiKey) {
    throw new Error('Azure OpenAI credentials not configured. Please set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY.');
  }

  const allMessages: OpenAIMessage[] = systemPrompt 
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  const requestBody = {
    messages: allMessages,
    max_tokens: config.maxTokens || 800,
    temperature: config.temperature || 0.7,
    top_p: config.topP || 0.95,
    frequency_penalty: config.frequencyPenalty || 0,
    presence_penalty: config.presencePenalty || 0,
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure OpenAI API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(`Azure OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from Azure OpenAI');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Azure OpenAI:', error);
    throw error;
  }
}

// Enhanced prompt templates
export const PromptTemplates = {
  subredditSuggestion: (description: string, url?: string) => ({
    system: 'You are a Reddit expert who helps app developers find relevant communities. Provide specific, active subreddit names where developers can authentically engage with potential users.',
    user: `Based on this app: "${description}"${url ? ` (${url})` : ''}, suggest 8-10 relevant subreddits where the developer could engage with potential users.

Requirements:
- Focus on active communities with engaged users
- Include both niche and broader subreddits
- Avoid overly promotional or spam-heavy communities
- Consider where the target audience naturally discusses their problems

Return ONLY a valid JSON array of subreddit names without the r/ prefix.
Example format: ["webdev", "SaaS", "startups"]`,
  }),

  responseGeneration: (projectName: string, projectDescription: string, postContent: string, persona: string) => ({
    system: persona,
    user: `The user posted: "${postContent}"

Generate a helpful, authentic response about ${projectName}: ${projectDescription}

Guidelines:
- Keep it under 200 words
- Be conversational and genuine
- Provide real value, not just promotion
- Mention the app naturally if it solves their problem
- Don't oversell or sound like an ad
- Ask follow-up questions if appropriate
- Use Reddit's tone (casual, friendly, direct)

Response:`,
  }),

  postGeneration: (projectName: string, projectDescription: string, subreddit: string, userPrompt?: string, enhance?: boolean) => {
    if (enhance && userPrompt) {
      return {
        system: 'You are an expert at crafting authentic, engaging Reddit posts that provide value and generate discussion.',
        user: `Enhance this post for r/${subreddit}: "${userPrompt}"

About the app: ${projectName} - ${projectDescription}

Guidelines:
- Maintain the core message
- Make it more engaging and Reddit-appropriate
- Add a discussion hook or question
- Follow r/${subreddit}'s tone and culture
- Keep promotional elements subtle
- Ensure it provides value to readers

Enhanced post:`,
      };
    }

    return {
      system: 'You are an expert at crafting authentic, valuable Reddit posts that generate meaningful discussion.',
      user: `Create a Reddit post for r/${subreddit} about ${projectName}: ${projectDescription}

User guidance: ${userPrompt || 'Create an engaging, valuable post'}

Guidelines:
- Start with a hook or interesting question
- Share a genuine story or problem you solved
- Provide real value (tips, insights, lessons learned)
- Mention the app naturally if relevant
- Keep it conversational and authentic
- End with a question to spark discussion
- Follow r/${subreddit}'s culture and rules
- Avoid sounding promotional or salesy

Reddit post:`,
    };
  },

  postIdeas: (projectName: string, projectDescription: string) => ({
    system: 'You are a creative Reddit content strategist who generates engaging post ideas that provide value and spark discussion.',
    user: `Generate 3 engaging Reddit post ideas for ${projectName}: ${projectDescription}

Each idea should:
- Provide genuine value to the community
- Spark discussion or help others
- Naturally relate to the app without being promotional
- Be specific and actionable
- Fit Reddit's culture

Return as a JSON array of 3 specific post ideas (not generic templates).
Example format: ["Share how we solved [specific problem] when building [app]", "Ask for feedback on [feature] approach", "Lessons learned from [experience]"]`,
  }),

  relevanceAnalysis: (projectDescription: string, content: string) => ({
    system: 'You are an expert at analyzing Reddit content for relevance to specific apps or products.',
    user: `Project: ${projectDescription}

Reddit content: "${content}"

Analyze if this content is relevant for engagement. Consider:
- Does the user have a problem the app could solve?
- Are they asking for recommendations?
- Is it a discussion where the app would add value?
- Would engagement feel natural and helpful?

Return a JSON object:
{
  "relevant": boolean,
  "confidence": number (0-100),
  "reason": "brief explanation",
  "recommended_approach": "how to engage if relevant"
}`,
  }),
};

// Helper to safely parse JSON responses
export function safeJSONParse<T>(text: string, fallback: T): T {
  try {
    if (!text || text.trim() === '') {
      console.error('Empty response received from AI');
      return fallback;
    }

    console.log('Attempting to parse AI response:', text.substring(0, 200) + '...');

    // Try to extract JSON if it's embedded in markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonText = jsonMatch ? jsonMatch[1] : text;
    
    const trimmed = jsonText.trim();
    
    if (!trimmed) {
      console.error('Empty JSON after trimming');
      return fallback;
    }

    const parsed = JSON.parse(trimmed);
    console.log('Successfully parsed JSON');
    return parsed;
  } catch (error) {
    console.error('Failed to parse JSON response');
    console.error('Raw text:', text);
    console.error('Parse error:', error);
    return fallback;
  }
}

// Validate and sanitize AI-generated content
export function sanitizeResponse(content: string): string {
  // Remove markdown code blocks if present
  content = content.replace(/```(?:json|markdown)?\s*([\s\S]*?)\s*```/g, '$1');
  
  // Trim whitespace
  content = content.trim();
  
  // Remove common AI disclaimers
  const disclaimers = [
    /^(?:Here'?s|Here is) (?:a|an|the) .*?:\s*/i,
    /^(?:Sure|Certainly|Of course)[,!]\s*/i,
  ];
  
  for (const pattern of disclaimers) {
    content = content.replace(pattern, '');
  }
  
  return content;
}

// Check if response seems promotional or spammy
export function isSpammy(content: string): boolean {
  const spamIndicators = [
    /check out our/i,
    /visit our website/i,
    /click here/i,
    /limited time offer/i,
    /buy now/i,
    /sign up today/i,
    /\$\d+\.?\d* off/i,
    /discount code/i,
  ];
  
  let spamScore = 0;
  for (const pattern of spamIndicators) {
    if (pattern.test(content)) {
      spamScore++;
    }
  }
  
  // If more than 2 spam indicators, flag as spammy
  return spamScore > 2;
}

// Rate limiting helper
const rateLimits = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(userId: string, limit: number = 20, windowMs: number = 60000): boolean {
  const now = Date.now();
  const userLimit = rateLimits.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimits.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (userLimit.count >= limit) {
    return false;
  }
  
  userLimit.count++;
  return true;
}
