// OpenRouter Integration Module for Perplexity Sonar

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

// Call OpenRouter API with Perplexity Sonar
export async function callOpenRouter(
  messages: OpenRouterMessage[],
  systemPrompt?: string,
  config: OpenRouterConfig = {}
): Promise<string> {
  const apiKey = Deno.env.get('OPENROUTER_API_KEY');

  if (!apiKey) {
    throw new Error('OpenRouter API key not configured. Please set OPENROUTER_API_KEY environment variable.');
  }

  const allMessages: OpenRouterMessage[] = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  const requestBody = {
    model: config.model || 'perplexity/sonar',
    messages: allMessages,
    max_tokens: config.maxTokens || 800,
    temperature: config.temperature || 0.7,
    top_p: config.topP || 0.95,
  };

  console.log('Calling OpenRouter API with model:', requestBody.model);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://pubhub.dev',
        'X-Title': 'PubHub',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenRouter response format:', data);
      throw new Error('Invalid response format from OpenRouter');
    }

    console.log('OpenRouter API call successful');
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenRouter:', error);
    throw error;
  }
}

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
