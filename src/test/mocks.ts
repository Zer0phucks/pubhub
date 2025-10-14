import { vi } from 'vitest';

// Mock Clerk
export const mockClerkUser = {
  id: 'user_test123',
  firstName: 'Test',
  lastName: 'User',
  fullName: 'Test User',
  primaryEmailAddress: {
    emailAddress: 'test@example.com',
  },
};

export const mockUseUser = vi.fn(() => ({
  user: mockClerkUser,
  isLoaded: true,
  isSignedIn: true,
}));

export const mockUseAuth = vi.fn(() => ({
  getToken: vi.fn().mockResolvedValue('mock-token'),
  signOut: vi.fn(),
  isLoaded: true,
  isSignedIn: true,
}));

export const mockClerkProvider = ({ children }: { children: React.ReactNode }) => children;

// Mock API responses
export const mockUserProfile = {
  id: 'user_test123',
  email: 'test@example.com',
  name: 'Test User',
  tier: 'free',
  theme: 'system',
};

export const mockProject = {
  id: 'proj_123',
  name: 'Test Project',
  description: 'A test project',
  url: 'https://example.com',
  subreddits: ['testsubreddit'],
  demo_mode: false,
  created_at: '2025-01-01T00:00:00Z',
};

export const mockFeedItem = {
  id: 'feed_123',
  project_id: 'proj_123',
  post_id: 'post_123',
  post_title: 'Test Post',
  post_content: 'This is a test post',
  subreddit: 'testsubreddit',
  relevance_score: 0.8,
  engagement_score: 100,
  status: 'pending',
  created_at: '2025-01-01T00:00:00Z',
};

// Mock API
export const mockApi = {
  initProfile: vi.fn().mockResolvedValue(mockUserProfile),
  getUserProfile: vi.fn().mockResolvedValue(mockUserProfile),
  updateUserProfile: vi.fn().mockResolvedValue({ success: true }),
  getProjects: vi.fn().mockResolvedValue([mockProject]),
  getProject: vi.fn().mockResolvedValue(mockProject),
  createProject: vi.fn().mockResolvedValue(mockProject),
  updateProject: vi.fn().mockResolvedValue({ success: true }),
  deleteProject: vi.fn().mockResolvedValue({ success: true }),
  getFeed: vi.fn().mockResolvedValue([mockFeedItem]),
  generateResponse: vi.fn().mockResolvedValue({ response: 'Generated response' }),
  generatePost: vi.fn().mockResolvedValue({ post: 'Generated post' }),
  suggestPosts: vi.fn().mockResolvedValue({ suggestions: [] }),
  updateFeedItem: vi.fn().mockResolvedValue({ success: true }),
  validateSubreddit: vi.fn().mockResolvedValue({ valid: true }),
  monitorSubreddits: vi.fn().mockResolvedValue({ success: true }),
  suggestSubreddits: vi.fn().mockResolvedValue({ suggestions: ['test1', 'test2'] }),
  scanHistory: vi.fn().mockResolvedValue({ success: true }),
};

// Helper to reset all mocks
export const resetAllMocks = () => {
  vi.clearAllMocks();
  mockUseUser.mockReturnValue({
    user: mockClerkUser,
    isLoaded: true,
    isSignedIn: true,
  });
  mockUseAuth.mockReturnValue({
    getToken: vi.fn().mockResolvedValue('mock-token'),
    signOut: vi.fn(),
    isLoaded: true,
    isSignedIn: true,
  });
};
