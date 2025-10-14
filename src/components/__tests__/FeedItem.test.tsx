import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeedItem } from '../FeedItem';
import * as apiModule from '../../lib/api';

vi.mock('../../lib/api');

describe('FeedItem Component', () => {
  const mockGenerateResponse = vi.fn();
  const mockOnUpdate = vi.fn();

  const mockItem = {
    id: 'feed_123',
    projectId: 'proj_123',
    type: 'post',
    subreddit: 'testsubreddit',
    title: 'Test Post Title',
    content: 'This is test content',
    author: 'testauthor',
    url: 'https://reddit.com/test',
    score: 42,
    num_comments: 10,
    created_at: '2025-01-01T00:00:00Z',
    ai_response: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(apiModule, 'api', 'get').mockReturnValue({
      generateResponse: mockGenerateResponse,
    } as any);
  });

  it('should render feed item with all details', () => {
    render(<FeedItem item={mockItem} onUpdate={mockOnUpdate} />);

    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    expect(screen.getByText(/This is test content/)).toBeInTheDocument();
    expect(screen.getByText('r/testsubreddit')).toBeInTheDocument();
    expect(screen.getByText(/testauthor/)).toBeInTheDocument();
  });

  it('should display score and comment count', () => {
    render(<FeedItem item={mockItem} onUpdate={mockOnUpdate} />);

    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('should have link to Reddit post', () => {
    render(<FeedItem item={mockItem} onUpdate={mockOnUpdate} />);

    const link = screen.getByText('View on Reddit');
    expect(link.closest('a')).toHaveAttribute('href', 'https://reddit.com/test');
    expect(link.closest('a')).toHaveAttribute('target', '_blank');
  });

  it('should show "Generate AI Response" button initially', () => {
    render(<FeedItem item={mockItem} onUpdate={mockOnUpdate} />);

    expect(screen.getByText('Generate AI Response')).toBeInTheDocument();
  });

  it('should generate response when button is clicked', async () => {
    mockGenerateResponse.mockResolvedValue({ response: 'Generated AI response' });
    const user = userEvent.setup();

    render(<FeedItem item={mockItem} onUpdate={mockOnUpdate} />);

    const generateButton = screen.getByText('Generate AI Response');
    await user.click(generateButton);

    await waitFor(() => {
      expect(mockGenerateResponse).toHaveBeenCalledWith(
        'proj_123',
        'feed_123',
        'Test Post Title This is test content'
      );
    });

    expect(await screen.findByText('Generated AI response')).toBeInTheDocument();
    expect(mockOnUpdate).toHaveBeenCalled();
  });

  it('should show loading state while generating response', async () => {
    mockGenerateResponse.mockImplementation(() => new Promise(() => {})); // Never resolves
    const user = userEvent.setup();

    render(<FeedItem item={mockItem} onUpdate={mockOnUpdate} />);

    const generateButton = screen.getByText('Generate AI Response');
    await user.click(generateButton);

    expect(await screen.findByText('Generating response...')).toBeInTheDocument();
  });

  it('should display existing AI response', () => {
    const itemWithResponse = {
      ...mockItem,
      ai_response: 'This is a pre-generated response',
    };

    render(<FeedItem item={itemWithResponse} onUpdate={mockOnUpdate} />);

    expect(screen.getByText('This is a pre-generated response')).toBeInTheDocument();
    expect(screen.queryByText('Generate AI Response')).not.toBeInTheDocument();
  });

  it('should show response editing UI', async () => {
    const itemWithResponse = {
      ...mockItem,
      ai_response: 'Original response',
    };

    render(<FeedItem item={itemWithResponse} onUpdate={mockOnUpdate} />);

    // Verify response is displayed
    expect(screen.getByText('Original response')).toBeInTheDocument();
    expect(screen.getByText('AI Generated Response')).toBeInTheDocument();
  });

  it('should allow discarding AI response', async () => {
    const itemWithResponse = {
      ...mockItem,
      ai_response: 'Response to discard',
    };
    const user = userEvent.setup();

    render(<FeedItem item={itemWithResponse} onUpdate={mockOnUpdate} />);

    // Find and click the discard button (identified by X icon)
    const discardButton = screen.getAllByRole('button').find(btn => {
      const svg = btn.querySelector('svg');
      return svg?.classList.contains('lucide-x');
    });

    expect(discardButton).toBeDefined();
    await user.click(discardButton!);

    // Response should be hidden, generate button should appear
    expect(screen.queryByText('Response to discard')).not.toBeInTheDocument();
    expect(screen.getByText('Generate AI Response')).toBeInTheDocument();
  });

  it('should format dates correctly', () => {
    const now = new Date();
    const hoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000); // 5 hours ago

    const recentItem = {
      ...mockItem,
      created_at: hoursAgo.toISOString(),
    };

    render(<FeedItem item={recentItem} onUpdate={mockOnUpdate} />);

    expect(screen.getByText(/5h ago/)).toBeInTheDocument();
  });
});
