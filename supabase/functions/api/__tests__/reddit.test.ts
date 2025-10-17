import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock Deno.env
const mockEnv = {
  get: vi.fn((key: string) => {
    const env: Record<string, string> = {
      'REDDIT_CLIENT_ID': 'test_client_id',
      'REDDIT_CLIENT_SECRET': 'test_client_secret',
    };
    return env[key];
  }),
};
// @ts-ignore
global.Deno = { env: mockEnv };

// Import after mocks are set up
const reddit = await import('../reddit.tsx');

describe('Reddit Module', () => {
  beforeEach(async () => {
    mockFetch.mockClear();
    mockEnv.get.mockClear();
    vi.clearAllMocks();

    // Clear token cache between tests
    reddit.__resetTokenCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();

    // Also clear cache after test
    reddit.__resetTokenCache();
  });

  describe('isValidSubredditName', () => {
    it('should accept valid subreddit names', () => {
      expect(reddit.isValidSubredditName('webdev')).toBe(true);
      expect(reddit.isValidSubredditName('javascript')).toBe(true);
      expect(reddit.isValidSubredditName('test123')).toBe(true);
      expect(reddit.isValidSubredditName('Test_Subreddit')).toBe(true);
    });

    it('should reject invalid subreddit names', () => {
      expect(reddit.isValidSubredditName('')).toBe(false);
      expect(reddit.isValidSubredditName('ab')).toBe(false); // Too short
      expect(reddit.isValidSubredditName('a'.repeat(22))).toBe(false); // Too long
      expect(reddit.isValidSubredditName('test-subreddit')).toBe(false); // Contains hyphen
      expect(reddit.isValidSubredditName('test subreddit')).toBe(false); // Contains space
      expect(reddit.isValidSubredditName('test@subreddit')).toBe(false); // Special char
    });
  });

  describe('extractKeywords', () => {
    it('should extract keywords from description', () => {
      const description = 'A productivity app for developers to manage tasks and workflows';
      const keywords = reddit.extractKeywords(description);

      expect(keywords).toContain('productivity');
      expect(keywords).toContain('developers');
      expect(keywords).toContain('manage');
      expect(keywords).toContain('tasks');
      expect(keywords).toContain('workflows');
    });

    it('should filter out stop words', () => {
      const description = 'This is a tool for the developers';
      const keywords = reddit.extractKeywords(description);

      expect(keywords).not.toContain('this');
      expect(keywords).not.toContain('is');
      expect(keywords).not.toContain('a');
      expect(keywords).not.toContain('for');
      expect(keywords).not.toContain('the');
      expect(keywords).toContain('tool');
      expect(keywords).toContain('developers');
    });

    it('should filter words shorter than 4 characters', () => {
      const description = 'Big app for web dev';
      const keywords = reddit.extractKeywords(description);

      expect(keywords).not.toContain('big');
      expect(keywords).not.toContain('app');
      expect(keywords).not.toContain('for');
      expect(keywords).not.toContain('web');
      expect(keywords).not.toContain('dev');
    });

    it('should return unique keywords in lowercase', () => {
      const description = 'Productivity PRODUCTIVITY productivity tool Tool';
      const keywords = reddit.extractKeywords(description);

      const productivityCount = keywords.filter(k => k === 'productivity').length;
      const toolCount = keywords.filter(k => k === 'tool').length;

      expect(productivityCount).toBe(1);
      expect(toolCount).toBe(1);
    });
  });

  describe('calculateRelevanceScore', () => {
    it('should calculate score based on keyword matches', () => {
      const text = 'I need a productivity tool for developers to manage tasks';
      const keywords = ['productivity', 'developers', 'tasks'];

      const score = reddit.calculateRelevanceScore(text, keywords);

      // Each keyword match = 10 points
      expect(score).toBeGreaterThanOrEqual(30);
    });

    it('should match keywords with word boundaries', () => {
      const text = 'This is about development productivity';
      const keywords = ['develop']; // Should NOT match 'development'

      const score = reddit.calculateRelevanceScore(text, keywords);

      expect(score).toBe(0);
    });

    it('should be case insensitive', () => {
      const text = 'PRODUCTIVITY is important for DEVELOPERS';
      const keywords = ['productivity', 'developers'];

      const score = reddit.calculateRelevanceScore(text, keywords);

      expect(score).toBeGreaterThanOrEqual(20);
    });

    it('should count multiple occurrences', () => {
      const text = 'productivity productivity productivity';
      const keywords = ['productivity'];

      const score = reddit.calculateRelevanceScore(text, keywords);

      expect(score).toBeGreaterThanOrEqual(30); // 3 matches * 10 points
    });

    it('should return 0 for no matches', () => {
      const text = 'This text has no relevant keywords';
      const keywords = ['productivity', 'developers'];

      const score = reddit.calculateRelevanceScore(text, keywords);

      expect(score).toBe(0);
    });
  });

  describe('isRelevant', () => {
    it('should return true when keywords are found', () => {
      const text = 'I love using productivity tools for development';
      const keywords = ['productivity', 'development'];

      expect(reddit.isRelevant(text, keywords)).toBe(true);
    });

    it('should return false when no keywords found', () => {
      const text = 'This is completely unrelated content';
      const keywords = ['productivity', 'development'];

      expect(reddit.isRelevant(text, keywords)).toBe(false);
    });

    it('should be case insensitive', () => {
      const text = 'PRODUCTIVITY tools are great';
      const keywords = ['productivity'];

      expect(reddit.isRelevant(text, keywords)).toBe(true);
    });

    it('should handle empty keywords array', () => {
      const text = 'Some text';
      const keywords: string[] = [];

      expect(reddit.isRelevant(text, keywords)).toBe(false);
    });
  });

  describe('formatRedditTimestamp', () => {
    it('should format Unix timestamp to ISO string', () => {
      const timestamp = 1704067200; // 2024-01-01 00:00:00 UTC
      const formatted = reddit.formatRedditTimestamp(timestamp);

      expect(formatted).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should handle current timestamp', () => {
      const now = Math.floor(Date.now() / 1000);
      const formatted = reddit.formatRedditTimestamp(now);
      const parsed = new Date(formatted);

      expect(parsed.getTime()).toBeCloseTo(now * 1000, -3);
    });
  });

  describe('getRedditToken', () => {
    it('should fetch and cache Reddit application token', async () => {
      const mockToken = {
        access_token: 'mock_access_token',
        token_type: 'bearer',
        expires_in: 3600,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockToken,
      });

      const token = await reddit.getRedditToken();

      expect(token).toBe('mock_access_token');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.reddit.com/api/v1/access_token',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Basic'),
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
        })
      );
    });

    it('should use cached token if not expired', async () => {
      // First call to populate cache
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'cached_token',
          expires_in: 3600,
        }),
      });

      await reddit.getRedditToken();

      // Second call should use cache
      mockFetch.mockClear();
      const token = await reddit.getRedditToken();

      expect(token).toBe('cached_token');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should throw error on failed token fetch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => 'Unauthorized',
      });

      await expect(reddit.getRedditToken()).rejects.toThrow('Reddit authentication failed');
    });
  });

  describe('exchangeCodeForToken', () => {
    it('should exchange authorization code for user tokens', async () => {
      const mockTokenResponse = {
        access_token: 'user_access_token',
        refresh_token: 'user_refresh_token',
        expires_in: 3600,
        scope: 'identity read submit',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      });

      const code = 'auth_code_123';
      const redirectUri = 'https://example.com/callback';

      const tokens = await reddit.exchangeCodeForToken(code, redirectUri);

      expect(tokens).toHaveProperty('access_token', 'user_access_token');
      expect(tokens).toHaveProperty('refresh_token', 'user_refresh_token');
      expect(tokens).toHaveProperty('expires_at');
      expect(tokens).toHaveProperty('scope', 'identity read submit');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.reddit.com/api/v1/access_token',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining(`code=${code}`),
        })
      );
    });

    it('should throw error on failed token exchange', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => 'Bad Request',
      });

      await expect(
        reddit.exchangeCodeForToken('invalid_code', 'https://example.com')
      ).rejects.toThrow('Failed to exchange code for token');
    });
  });

  describe('refreshUserToken', () => {
    it('should refresh user access token using refresh token', async () => {
      const mockRefreshResponse = {
        access_token: 'new_access_token',
        expires_in: 3600,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRefreshResponse,
      });

      const refreshToken = 'refresh_token_123';
      const newTokens = await reddit.refreshUserToken(refreshToken);

      expect(newTokens).toHaveProperty('access_token', 'new_access_token');
      expect(newTokens).toHaveProperty('expires_at');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.reddit.com/api/v1/access_token',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining(`refresh_token=${refreshToken}`),
        })
      );
    });

    it('should throw error on failed token refresh', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => 'Unauthorized',
      });

      await expect(
        reddit.refreshUserToken('invalid_refresh_token')
      ).rejects.toThrow('Failed to refresh token');
    });
  });

  describe('getUserToken', () => {
    it('should return valid access token if not expired', async () => {
      const userTokens = {
        access_token: 'valid_token',
        refresh_token: 'refresh_token',
        expires_at: Date.now() + 3600000, // Expires in 1 hour
        scope: 'identity read',
      };

      const token = await reddit.getUserToken(userTokens);

      expect(token).toBe('valid_token');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should refresh token if expired', async () => {
      const userTokens = {
        access_token: 'expired_token',
        refresh_token: 'refresh_token',
        expires_at: Date.now() - 1000, // Expired
        scope: 'identity read',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'new_token',
          expires_in: 3600,
        }),
      });

      const token = await reddit.getUserToken(userTokens);

      expect(token).toBe('new_token');
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should refresh token if close to expiry (within buffer)', async () => {
      const userTokens = {
        access_token: 'almost_expired_token',
        refresh_token: 'refresh_token',
        expires_at: Date.now() + 30000, // Expires in 30 seconds (within 1 min buffer)
        scope: 'identity read',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'refreshed_token',
          expires_in: 3600,
        }),
      });

      const token = await reddit.getUserToken(userTokens);

      expect(token).toBe('refreshed_token');
      expect(mockFetch).toHaveBeenCalled();
    });
  });
});
