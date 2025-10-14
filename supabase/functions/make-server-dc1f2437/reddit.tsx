// Reddit API Integration Module

interface RedditCredentials {
  clientId: string;
  clientSecret: string;
  accessToken?: string;
  tokenExpiry?: number;
}

let redditToken: { token: string; expiry: number } | null = null;

// Get Reddit OAuth token
export async function getRedditToken(): Promise<string> {
  const clientId = Deno.env.get('REDDIT_CLIENT_ID');
  const clientSecret = Deno.env.get('REDDIT_CLIENT_SECRET');
  
  if (!clientId || !clientSecret) {
    throw new Error('Reddit API credentials not configured. Please set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET environment variables.');
  }

  // Return cached token if still valid
  if (redditToken && redditToken.expiry > Date.now()) {
    return redditToken.token;
  }

  // Get new token
  const auth = btoa(`${clientId}:${clientSecret}`);
  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'PubHub/1.0 (by /u/PubHubApp)',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Reddit authentication failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  redditToken = {
    token: data.access_token,
    expiry: Date.now() + (data.expires_in * 1000) - 60000, // 1 min buffer
  };

  return redditToken.token;
}

// Search posts in a subreddit with keyword filtering
export async function searchSubredditPosts(
  subreddit: string,
  keywords: string[],
  limit: number = 100,
  timeframe: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all' = 'month'
): Promise<any[]> {
  const token = await getRedditToken();
  const query = keywords.join(' OR ');
  
  const response = await fetch(
    `https://oauth.reddit.com/r/${subreddit}/search?q=${encodeURIComponent(query)}&restrict_sr=1&sort=new&t=${timeframe}&limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'PubHub/1.0 (by /u/PubHubApp)',
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to search r/${subreddit}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data.children.map((child: any) => child.data);
}

// Get recent posts from a subreddit
export async function getSubredditPosts(
  subreddit: string,
  limit: number = 100,
  after?: string
): Promise<{ posts: any[]; after: string | null }> {
  const token = await getRedditToken();
  
  let url = `https://oauth.reddit.com/r/${subreddit}/new?limit=${limit}`;
  if (after) {
    url += `&after=${after}`;
  }
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'PubHub/1.0 (by /u/PubHubApp)',
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch posts from r/${subreddit}: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    posts: data.data.children.map((child: any) => child.data),
    after: data.data.after,
  };
}

// Get comments from a post
export async function getPostComments(
  subreddit: string,
  postId: string,
  limit: number = 100
): Promise<any[]> {
  const token = await getRedditToken();
  
  const response = await fetch(
    `https://oauth.reddit.com/r/${subreddit}/comments/${postId}?limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'PubHub/1.0 (by /u/PubHubApp)',
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch comments: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Extract comments (second element in the listing)
  const commentListing = data[1];
  return flattenComments(commentListing.data.children);
}

// Flatten nested comment structure
function flattenComments(comments: any[]): any[] {
  const result: any[] = [];
  
  for (const comment of comments) {
    if (comment.kind === 't1') { // t1 is a comment
      result.push(comment.data);
      
      // Recursively flatten replies
      if (comment.data.replies && comment.data.replies.data) {
        result.push(...flattenComments(comment.data.replies.data.children));
      }
    }
  }
  
  return result;
}

// Get subreddit info
export async function getSubredditInfo(subreddit: string): Promise<any> {
  const token = await getRedditToken();
  
  const response = await fetch(
    `https://oauth.reddit.com/r/${subreddit}/about`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'PubHub/1.0 (by /u/PubHubApp)',
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch subreddit info: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
}

// Check if text is relevant to project keywords
export function isRelevant(text: string, keywords: string[]): boolean {
  const lowerText = text.toLowerCase();
  const lowerKeywords = keywords.map(k => k.toLowerCase());
  
  // Check if at least one keyword is present
  return lowerKeywords.some(keyword => {
    // Split keyword into words for multi-word matching
    const keywordWords = keyword.split(/\s+/);
    return keywordWords.every(word => lowerText.includes(word));
  });
}

// Extract keywords from project description
export function extractKeywords(description: string): string[] {
  // Remove common words and extract meaningful keywords
  const commonWords = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'to', 'of', 'in', 'for', 'on', 'with',
    'at', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'and',
    'or', 'but', 'not', 'so', 'than', 'that', 'this', 'these', 'those',
  ]);
  
  const words = description.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word));
  
  // Return unique keywords
  return [...new Set(words)];
}

// Calculate relevance score
export function calculateRelevanceScore(
  text: string,
  keywords: string[],
  debug: boolean = false
): number {
  const lowerText = text.toLowerCase();
  let score = 0;
  const matchedKeywords: string[] = [];

  for (const keyword of keywords) {
    const lowerKeyword = keyword.toLowerCase();
    const regex = new RegExp(`\\b${lowerKeyword}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      score += matches.length * 10;
      matchedKeywords.push(`${keyword}(${matches.length})`);
    }
  }

  if (debug && matchedKeywords.length > 0) {
    console.log(`   Matched keywords: ${matchedKeywords.join(', ')} → Score: ${score}`);
  }

  return score;
}

// Format Reddit timestamp
export function formatRedditTimestamp(unixTimestamp: number): string {
  return new Date(unixTimestamp * 1000).toISOString();
}

// Validate subreddit name
export function isValidSubredditName(name: string): boolean {
  // Subreddit names are 3-21 characters, alphanumeric + underscore
  return /^[a-zA-Z0-9_]{3,21}$/.test(name);
}
