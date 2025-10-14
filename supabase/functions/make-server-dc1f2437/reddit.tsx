// Reddit API Integration Module

interface RedditCredentials {
  clientId: string;
  clientSecret: string;
  accessToken?: string;
  tokenExpiry?: number;
}

interface UserRedditTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  scope: string;
}

let redditToken: { token: string; expiry: number } | null = null;

function createRequestId(scope: string): string {
  const base = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${scope}-${base}`;
}

// Get Reddit OAuth token
export async function getRedditToken(): Promise<string> {
  const clientId = Deno.env.get('REDDIT_CLIENT_ID');
  const clientSecret = Deno.env.get('REDDIT_CLIENT_SECRET');
  
  if (!clientId || !clientSecret) {
    throw new Error('Reddit API credentials not configured. Please set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET environment variables.');
  }

  // Return cached token if still valid
  if (redditToken && redditToken.expiry > Date.now()) {
    console.debug('[Reddit][Token] Using cached token', {
      expiresInMs: redditToken.expiry - Date.now(),
    });
    return redditToken.token;
  }

  // Get new token
  const auth = btoa(`${clientId}:${clientSecret}`);
  const requestId = createRequestId('reddit-token');
  const startTime = Date.now();

  console.debug('[Reddit][Token] Requesting new access token', {
    requestId,
    clientIdSuffix: clientId.slice(-4),
  });

  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'PubHub/1.0 (by /u/PubHubApp)',
    },
    body: 'grant_type=client_credentials',
  });

  const durationMs = Date.now() - startTime;
  console.debug('[Reddit][Token] Token response received', {
    requestId,
    status: response.status,
    durationMs,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Reddit][Token] Token request failed', {
      requestId,
      status: response.status,
      statusText: response.statusText,
      errorPreview: errorText.length > 500 ? `${errorText.slice(0, 500)}…` : errorText,
    });
    throw new Error(`Reddit authentication failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.debug('[Reddit][Token] Token acquired', {
    requestId,
    expiresIn: data.expires_in,
    scope: data.scope,
  });

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
  const requestId = createRequestId('reddit-search');
  const startTime = Date.now();
  const url = `https://oauth.reddit.com/r/${subreddit}/search?q=${encodeURIComponent(query)}&restrict_sr=1&sort=new&t=${timeframe}&limit=${limit}`;

  console.debug('[Reddit][searchSubredditPosts] Request initiated', {
    requestId,
    subreddit,
    keywords,
    limit,
    timeframe,
  });
  
  const response = await fetch(
    url,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'PubHub/1.0 (by /u/PubHubApp)',
      }
    }
  );

  const durationMs = Date.now() - startTime;
  console.debug('[Reddit][searchSubredditPosts] Response received', {
    requestId,
    status: response.status,
    durationMs,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Reddit][searchSubredditPosts] Request failed', {
      requestId,
      status: response.status,
      statusText: response.statusText,
      errorPreview: errorText.length > 500 ? `${errorText.slice(0, 500)}…` : errorText,
    });
    throw new Error(`Failed to search r/${subreddit}: ${response.statusText}`);
  }

  const data = await response.json();
  const posts = data.data.children.map((child: any) => child.data);

  console.debug('[Reddit][searchSubredditPosts] Parsed posts', {
    requestId,
    resultCount: posts.length,
    after: data.data.after,
  });

  return posts;
}

// Get recent posts from a subreddit
export async function getSubredditPosts(
  subreddit: string,
  limit: number = 100,
  after?: string
): Promise<{ posts: any[]; after: string | null }> {
  const token = await getRedditToken();
  const requestId = createRequestId('reddit-posts');
  const startTime = Date.now();
  
  let url = `https://oauth.reddit.com/r/${subreddit}/new?limit=${limit}`;
  if (after) {
    url += `&after=${after}`;
  }

  console.debug('[Reddit][getSubredditPosts] Request initiated', {
    requestId,
    subreddit,
    limit,
    after,
  });
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'PubHub/1.0 (by /u/PubHubApp)',
    }
  });

  const durationMs = Date.now() - startTime;
  console.debug('[Reddit][getSubredditPosts] Response received', {
    requestId,
    status: response.status,
    durationMs,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Reddit][getSubredditPosts] Request failed', {
      requestId,
      status: response.status,
      statusText: response.statusText,
      errorPreview: errorText.length > 500 ? `${errorText.slice(0, 500)}…` : errorText,
    });
    throw new Error(`Failed to fetch posts from r/${subreddit}: ${response.statusText}`);
  }

  const data = await response.json();
  const posts = data.data.children.map((child: any) => child.data);

  console.debug('[Reddit][getSubredditPosts] Parsed posts', {
    requestId,
    resultCount: posts.length,
    after: data.data.after,
  });

  return {
    posts,
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
  const requestId = createRequestId('reddit-comments');
  const startTime = Date.now();
  
  const response = await fetch(
    `https://oauth.reddit.com/r/${subreddit}/comments/${postId}?limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'PubHub/1.0 (by /u/PubHubApp)',
      }
    }
  );

  const durationMs = Date.now() - startTime;
  console.debug('[Reddit][getPostComments] Response received', {
    requestId,
    subreddit,
    postId,
    status: response.status,
    durationMs,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Reddit][getPostComments] Request failed', {
      requestId,
      status: response.status,
      statusText: response.statusText,
      errorPreview: errorText.length > 500 ? `${errorText.slice(0, 500)}…` : errorText,
    });
    throw new Error(`Failed to fetch comments: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Extract comments (second element in the listing)
  const commentListing = data[1];
  const comments = flattenComments(commentListing.data.children);

  console.debug('[Reddit][getPostComments] Parsed comments', {
    requestId,
    commentCount: comments.length,
  });

  return comments;
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
  const requestId = createRequestId('reddit-info');
  const startTime = Date.now();
  
  const response = await fetch(
    `https://oauth.reddit.com/r/${subreddit}/about`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'PubHub/1.0 (by /u/PubHubApp)',
      }
    }
  );

  const durationMs = Date.now() - startTime;
  console.debug('[Reddit][getSubredditInfo] Response received', {
    requestId,
    subreddit,
    status: response.status,
    durationMs,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Reddit][getSubredditInfo] Request failed', {
      requestId,
      status: response.status,
      statusText: response.statusText,
      errorPreview: errorText.length > 500 ? `${errorText.slice(0, 500)}…` : errorText,
    });
    throw new Error(`Failed to fetch subreddit info: ${response.statusText}`);
  }

  const data = await response.json();
  console.debug('[Reddit][getSubredditInfo] Parsed subreddit info', {
    requestId,
    subscribers: data.data?.subscribers,
    activeUserCount: data.data?.accounts_active,
  });

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

// ============================================================================
// USER OAUTH FUNCTIONS
// ============================================================================

// Exchange authorization code for access token
export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<UserRedditTokens> {
  const clientId = Deno.env.get('REDDIT_CLIENT_ID');
  const clientSecret = Deno.env.get('REDDIT_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('Reddit API credentials not configured');
  }

  const auth = btoa(`${clientId}:${clientSecret}`);
  const requestId = createRequestId('reddit-oauth');
  const startTime = Date.now();

  console.log('[Reddit][OAuth] Exchanging code for token', { requestId });

  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'PubHub/1.0 (by /u/PubHubApp)',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }).toString(),
  });

  const durationMs = Date.now() - startTime;
  console.log('[Reddit][OAuth] Token exchange response', {
    requestId,
    status: response.status,
    durationMs,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Reddit][OAuth] Token exchange failed', {
      requestId,
      status: response.status,
      error: errorText,
    });
    throw new Error(`Failed to exchange code for token: ${response.status}`);
  }

  const data = await response.json();

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + (data.expires_in * 1000),
    scope: data.scope,
  };
}

// Refresh user's access token
export async function refreshUserToken(refreshToken: string): Promise<UserRedditTokens> {
  const clientId = Deno.env.get('REDDIT_CLIENT_ID');
  const clientSecret = Deno.env.get('REDDIT_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('Reddit API credentials not configured');
  }

  const auth = btoa(`${clientId}:${clientSecret}`);
  const requestId = createRequestId('reddit-refresh');
  const startTime = Date.now();

  console.log('[Reddit][Refresh] Refreshing user token', { requestId });

  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'PubHub/1.0 (by /u/PubHubApp)',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }).toString(),
  });

  const durationMs = Date.now() - startTime;
  console.log('[Reddit][Refresh] Refresh response', {
    requestId,
    status: response.status,
    durationMs,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Reddit][Refresh] Token refresh failed', {
      requestId,
      status: response.status,
      error: errorText,
    });
    throw new Error(`Failed to refresh token: ${response.status}`);
  }

  const data = await response.json();

  return {
    access_token: data.access_token,
    refresh_token: refreshToken, // Reddit doesn't return new refresh token
    expires_at: Date.now() + (data.expires_in * 1000),
    scope: data.scope,
  };
}

// Get valid user token (refresh if needed)
export async function getUserToken(tokens: UserRedditTokens): Promise<string> {
  // Check if token is expired or will expire in next 5 minutes
  if (tokens.expires_at < Date.now() + (5 * 60 * 1000)) {
    console.log('[Reddit][Token] User token expired, refreshing');
    const newTokens = await refreshUserToken(tokens.refresh_token);
    // Caller needs to save new tokens - return new access token
    return newTokens.access_token;
  }

  return tokens.access_token;
}

// Get subreddit posts with user token
export async function getSubredditPostsWithUserToken(
  userToken: string,
  subreddit: string,
  limit: number = 100,
  after?: string
): Promise<{ posts: any[]; after: string | null }> {
  const requestId = createRequestId('reddit-posts-user');
  const startTime = Date.now();

  let url = `https://oauth.reddit.com/r/${subreddit}/new?limit=${limit}`;
  if (after) {
    url += `&after=${after}`;
  }

  console.debug('[Reddit][getSubredditPostsUser] Request initiated', {
    requestId,
    subreddit,
    limit,
    after,
  });

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'User-Agent': 'PubHub/1.0 (by /u/PubHubApp)',
    }
  });

  const durationMs = Date.now() - startTime;
  console.debug('[Reddit][getSubredditPostsUser] Response received', {
    requestId,
    status: response.status,
    durationMs,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Reddit][getSubredditPostsUser] Request failed', {
      requestId,
      status: response.status,
      statusText: response.statusText,
      errorPreview: errorText.length > 500 ? `${errorText.slice(0, 500)}…` : errorText,
    });
    throw new Error(`Failed to fetch posts from r/${subreddit}: ${response.statusText}`);
  }

  const data = await response.json();
  const posts = data.data.children.map((child: any) => child.data);

  console.debug('[Reddit][getSubredditPostsUser] Parsed posts', {
    requestId,
    resultCount: posts.length,
    after: data.data.after,
  });

  return {
    posts,
    after: data.data.after,
  };
}

// Post a comment with user token
export async function postComment(
  userToken: string,
  parentFullname: string,
  text: string
): Promise<any> {
  const requestId = createRequestId('reddit-comment');
  const startTime = Date.now();

  console.log('[Reddit][postComment] Posting comment', {
    requestId,
    parentFullname,
    textLength: text.length,
  });

  const response = await fetch('https://oauth.reddit.com/api/comment', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'User-Agent': 'PubHub/1.0 (by /u/PubHubApp)',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      api_type: 'json',
      text,
      thing_id: parentFullname,
    }).toString(),
  });

  const durationMs = Date.now() - startTime;
  console.log('[Reddit][postComment] Response received', {
    requestId,
    status: response.status,
    durationMs,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Reddit][postComment] Request failed', {
      requestId,
      status: response.status,
      error: errorText,
    });
    throw new Error(`Failed to post comment: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (data.json?.errors && data.json.errors.length > 0) {
    const error = data.json.errors[0];
    console.error('[Reddit][postComment] Reddit API error', {
      requestId,
      error,
    });
    throw new Error(`Reddit API error: ${error[1]}`);
  }

  console.log('[Reddit][postComment] Comment posted successfully', { requestId });
  return data.json.data;
}

// Get user's Reddit identity
export async function getUserIdentity(userToken: string): Promise<any> {
  const requestId = createRequestId('reddit-identity');
  const startTime = Date.now();

  console.log('[Reddit][getUserIdentity] Fetching user identity', { requestId });

  const response = await fetch('https://oauth.reddit.com/api/v1/me', {
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'User-Agent': 'PubHub/1.0 (by /u/PubHubApp)',
    }
  });

  const durationMs = Date.now() - startTime;
  console.log('[Reddit][getUserIdentity] Response received', {
    requestId,
    status: response.status,
    durationMs,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Reddit][getUserIdentity] Request failed', {
      requestId,
      status: response.status,
      error: errorText,
    });
    throw new Error(`Failed to get user identity: ${response.status}`);
  }

  const data = await response.json();
  console.log('[Reddit][getUserIdentity] User identity fetched', {
    requestId,
    username: data.name,
  });

  return data;
}
