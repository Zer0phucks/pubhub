import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-dc1f2437`;

let getTokenFn: (() => Promise<string | null>) | null = null;

export function setGetTokenFunction(fn: () => Promise<string | null>) {
  getTokenFn = fn;
}

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  let token = publicAnonKey;
  let tokenType = 'Supabase Anon Key';
  
  if (getTokenFn) {
    try {
      const clerkToken = await getTokenFn();
      if (clerkToken) {
        token = clerkToken;
        tokenType = 'Clerk JWT';
      }
    } catch (error) {
      console.error('Error getting Clerk token:', error);
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const url = `${API_BASE}${endpoint}`;
  console.log('API Request:', url);
  console.log('Token type:', tokenType);
  console.log('Token (first 30 chars):', token.substring(0, 30) + '...');

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log('API Response:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error('API Request Failed:', error);
    throw error;
  }
}

export const api = {
  initProfile: () => apiRequest('/init-profile', { method: 'POST' }),

  getUserProfile: () => apiRequest('/user-profile'),

  updateUserProfile: (updates: any) =>
    apiRequest('/user-profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  getProjects: () => apiRequest('/projects'),

  getProject: (id: string) => apiRequest(`/projects/${id}`),

  createProject: (project: any) =>
    apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    }),

  updateProject: (id: string, updates: any) =>
    apiRequest(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  deleteProject: (id: string) =>
    apiRequest(`/projects/${id}`, { method: 'DELETE' }),

  suggestSubreddits: (description: string, url?: string) =>
    apiRequest('/suggest-subreddits', {
      method: 'POST',
      body: JSON.stringify({ description, url }),
    }),

  scanHistory: (projectId: string, subreddits: string[]) =>
    apiRequest('/scan-history', {
      method: 'POST',
      body: JSON.stringify({ projectId, subreddits }),
    }),

  getFeed: (projectId: string, sort: string = 'recent') =>
    apiRequest(`/feed/${projectId}?sort=${sort}`),

  generateResponse: (projectId: string, feedItemId: string, postContent: string) =>
    apiRequest('/generate-response', {
      method: 'POST',
      body: JSON.stringify({ projectId, feedItemId, postContent }),
    }),

  generatePost: (projectId: string, subreddit: string, userPrompt?: string, enhance?: boolean) =>
    apiRequest('/generate-post', {
      method: 'POST',
      body: JSON.stringify({ projectId, subreddit, userPrompt, enhance }),
    }),

  suggestPosts: (projectId: string) =>
    apiRequest('/suggest-posts', {
      method: 'POST',
      body: JSON.stringify({ projectId }),
    }),

  updateFeedItem: (projectId: string, itemId: string, updates: any) =>
    apiRequest(`/feed/${projectId}/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  validateSubreddit: (subreddit: string) =>
    apiRequest('/validate-subreddit', {
      method: 'POST',
      body: JSON.stringify({ subreddit }),
    }),

  monitorSubreddits: (projectId: string, subreddits: string[]) =>
    apiRequest('/monitor-subreddits', {
      method: 'POST',
      body: JSON.stringify({ projectId, subreddits }),
    }),

  // Reddit OAuth
  getRedditAuthUrl: () => apiRequest('/reddit/auth'),

  getRedditStatus: () => apiRequest('/reddit/status'),

  disconnectReddit: () => apiRequest('/reddit/disconnect', { method: 'POST' }),
};
