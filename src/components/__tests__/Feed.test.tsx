import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Feed } from '../Feed';
import * as apiModule from '../../lib/api';

vi.mock('../../lib/api');

describe('Feed Component', () => {
  const mockGetFeed = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(apiModule, 'api', 'get').mockReturnValue({
      getFeed: mockGetFeed,
    } as any);
  });

  it('should show loading state initially', () => {
    mockGetFeed.mockImplementation(() => new Promise(() => {})); // Never resolves
    const { container } = render(<Feed projectId="proj_123" />);

    // Check for loading spinner by looking for the animated spinner SVG
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should display feed items when loaded', async () => {
    const mockItems = [
      {
        id: 'feed_1',
        projectId: 'proj_123',
        type: 'post',
        subreddit: 'testsubreddit',
        title: 'Test Post 1',
        content: 'Content 1',
        author: 'testauthor',
        url: 'https://reddit.com/test1',
        score: 10,
        num_comments: 5,
        created_at: '2025-01-01T00:00:00Z',
        ai_response: null,
      },
      {
        id: 'feed_2',
        projectId: 'proj_123',
        type: 'post',
        subreddit: 'testsubreddit',
        title: 'Test Post 2',
        content: 'Content 2',
        author: 'testauthor',
        url: 'https://reddit.com/test2',
        score: 20,
        num_comments: 10,
        created_at: '2025-01-01T00:00:00Z',
        ai_response: null,
      },
    ];

    mockGetFeed.mockResolvedValue(mockItems);

    render(<Feed projectId="proj_123" />);

    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.getByText('Test Post 2')).toBeInTheDocument();
    });
  });

  it('should display empty state when no items', async () => {
    mockGetFeed.mockResolvedValue([]);

    render(<Feed projectId="proj_123" />);

    await waitFor(() => {
      expect(screen.getByText(/no items in your feed/i)).toBeInTheDocument();
    });
  });

  it('should render sort dropdown', async () => {
    mockGetFeed.mockResolvedValue([]);

    render(<Feed projectId="proj_123" />);

    await waitFor(() => {
      // Check that the combobox exists
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
      // Verify default value is shown
      expect(screen.getByText('Most Recent')).toBeInTheDocument();
    });
  });

  it('should refresh feed when refresh button is clicked', async () => {
    mockGetFeed.mockResolvedValue([]);
    const user = userEvent.setup();

    render(<Feed projectId="proj_123" />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '' })).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: '' });
    await user.click(refreshButton);

    // getFeed should be called twice (initial load + refresh)
    await waitFor(() => {
      expect(mockGetFeed).toHaveBeenCalledTimes(2);
    });
  });

  it('should call getFeed with correct parameters', async () => {
    mockGetFeed.mockResolvedValue([]);

    render(<Feed projectId="proj_123" />);

    await waitFor(() => {
      expect(mockGetFeed).toHaveBeenCalledWith('proj_123', 'recent');
    });
  });
});
