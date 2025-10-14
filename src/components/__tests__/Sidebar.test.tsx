import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from '../Sidebar';

describe('Sidebar Component', () => {
  it('should render all navigation items', () => {
    const mockOnToggle = vi.fn();
    const mockOnNavigate = vi.fn();

    render(
      <Sidebar
        collapsed={false}
        onToggle={mockOnToggle}
        activeView="feed"
        onNavigate={mockOnNavigate}
      />
    );

    expect(screen.getByText('Feed')).toBeInTheDocument();
    expect(screen.getByText('Post')).toBeInTheDocument();
    expect(screen.getByText('Project Settings')).toBeInTheDocument();
  });

  it('should highlight active view', () => {
    const mockOnToggle = vi.fn();
    const mockOnNavigate = vi.fn();

    render(
      <Sidebar
        collapsed={false}
        onToggle={mockOnToggle}
        activeView="feed"
        onNavigate={mockOnNavigate}
      />
    );

    const feedButton = screen.getByRole('button', { name: /feed/i });
    expect(feedButton).toHaveClass('bg-gradient-to-r');
  });

  it('should call onNavigate when navigation item is clicked', async () => {
    const mockOnToggle = vi.fn();
    const mockOnNavigate = vi.fn();
    const user = userEvent.setup();

    render(
      <Sidebar
        collapsed={false}
        onToggle={mockOnToggle}
        activeView="feed"
        onNavigate={mockOnNavigate}
      />
    );

    const postButton = screen.getByRole('button', { name: /post/i });
    await user.click(postButton);

    expect(mockOnNavigate).toHaveBeenCalledWith('post');
  });

  it('should call onToggle when collapse button is clicked', async () => {
    const mockOnToggle = vi.fn();
    const mockOnNavigate = vi.fn();
    const user = userEvent.setup();

    render(
      <Sidebar
        collapsed={false}
        onToggle={mockOnToggle}
        activeView="feed"
        onNavigate={mockOnNavigate}
      />
    );

    const collapseButton = screen.getByRole('button', { name: /collapse/i });
    await user.click(collapseButton);

    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('should hide labels when collapsed', () => {
    const mockOnToggle = vi.fn();
    const mockOnNavigate = vi.fn();

    render(
      <Sidebar
        collapsed={true}
        onToggle={mockOnToggle}
        activeView="feed"
        onNavigate={mockOnNavigate}
      />
    );

    // Labels should not be visible when collapsed
    expect(screen.queryByText('Feed')).not.toBeInTheDocument();
    expect(screen.queryByText('Post')).not.toBeInTheDocument();
    expect(screen.queryByText('Project Settings')).not.toBeInTheDocument();
    expect(screen.queryByText('Collapse')).not.toBeInTheDocument();
  });

  it('should show labels when not collapsed', () => {
    const mockOnToggle = vi.fn();
    const mockOnNavigate = vi.fn();

    render(
      <Sidebar
        collapsed={false}
        onToggle={mockOnToggle}
        activeView="feed"
        onNavigate={mockOnNavigate}
      />
    );

    // Labels should be visible when not collapsed
    expect(screen.getByText('Feed')).toBeInTheDocument();
    expect(screen.getByText('Post')).toBeInTheDocument();
    expect(screen.getByText('Project Settings')).toBeInTheDocument();
    expect(screen.getByText('Collapse')).toBeInTheDocument();
  });

  it('should render with correct width class when collapsed', () => {
    const mockOnToggle = vi.fn();
    const mockOnNavigate = vi.fn();

    const { container } = render(
      <Sidebar
        collapsed={true}
        onToggle={mockOnToggle}
        activeView="feed"
        onNavigate={mockOnNavigate}
      />
    );

    const sidebar = container.firstChild as HTMLElement;
    expect(sidebar).toHaveClass('w-16');
  });

  it('should render with correct width class when not collapsed', () => {
    const mockOnToggle = vi.fn();
    const mockOnNavigate = vi.fn();

    const { container } = render(
      <Sidebar
        collapsed={false}
        onToggle={mockOnToggle}
        activeView="feed"
        onNavigate={mockOnNavigate}
      />
    );

    const sidebar = container.firstChild as HTMLElement;
    expect(sidebar).toHaveClass('w-64');
  });
});
