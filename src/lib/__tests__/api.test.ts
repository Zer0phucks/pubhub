import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiRequest, api, setGetTokenFunction } from '../api';

describe('API Module', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    global.fetch = mockFetch;
    mockFetch.mockClear();
    // Reset console methods to avoid cluttering test output
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('setGetTokenFunction', () => {
    it('should set the token getter function', () => {
      const mockGetToken = vi.fn().mockResolvedValue('test-token');
      setGetTokenFunction(mockGetToken);
      expect(mockGetToken).toBeDefined();
    });
  });

  describe('apiRequest', () => {
    it('should make a successful API request with default headers', async () => {
      const mockResponse = { data: 'test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockResponse,
      });

      const result = await apiRequest('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': expect.stringContaining('Bearer'),
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should use Clerk token when getTokenFn is set and returns token', async () => {
      const mockGetToken = vi.fn().mockResolvedValue('clerk-token');
      setGetTokenFunction(mockGetToken);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ success: true }),
      });

      await apiRequest('/test');

      expect(mockGetToken).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer clerk-token',
          }),
        })
      );
    });

    it('should handle fetch errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiRequest('/test')).rejects.toThrow('Network error');
    });

    it('should handle non-OK responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Resource not found',
      });

      await expect(apiRequest('/test')).rejects.toThrow(/API Error: 404/);
    });

    it('should include custom headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({}),
      });

      await apiRequest('/test', {
        headers: {
          'X-Custom-Header': 'custom-value',
        },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'custom-value',
          }),
        })
      );
    });
  });

  describe('API Methods', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ success: true }),
      });
    });

    it('should call initProfile endpoint', async () => {
      await api.initProfile();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/init-profile'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('should call getUserProfile endpoint', async () => {
      await api.getUserProfile();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/user-profile'),
        expect.any(Object)
      );
    });

    it('should call updateUserProfile with data', async () => {
      const updates = { theme: 'dark' };
      await api.updateUserProfile(updates);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/user-profile'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updates),
        })
      );
    });

    it('should call getProjects endpoint', async () => {
      await api.getProjects();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/projects'),
        expect.any(Object)
      );
    });

    it('should call getProject with id', async () => {
      await api.getProject('proj_123');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/projects/proj_123'),
        expect.any(Object)
      );
    });

    it('should call createProject with data', async () => {
      const project = { name: 'Test Project' };
      await api.createProject(project);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/projects'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(project),
        })
      );
    });

    it('should call updateProject with id and data', async () => {
      const updates = { name: 'Updated Name' };
      await api.updateProject('proj_123', updates);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/projects/proj_123'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updates),
        })
      );
    });

    it('should call deleteProject with id', async () => {
      await api.deleteProject('proj_123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/projects/proj_123'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('should call getFeed with projectId and sort', async () => {
      await api.getFeed('proj_123', 'recent');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/feed/proj_123?sort=recent'),
        expect.any(Object)
      );
    });

    it('should call generateResponse with data', async () => {
      await api.generateResponse('proj_123', 'feed_123', 'test content');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/generate-response'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('proj_123'),
        })
      );
    });

    it('should call validateSubreddit with subreddit name', async () => {
      await api.validateSubreddit('testsubreddit');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/validate-subreddit'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('testsubreddit'),
        })
      );
    });
  });
});
