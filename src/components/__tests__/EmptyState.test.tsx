import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '../EmptyState';
import { Inbox } from 'lucide-react';

describe('EmptyState Component', () => {
  it('should render with icon, title, and description', () => {
    render(
      <EmptyState
        icon={Inbox}
        title="No items found"
        description="There are no items to display"
      />
    );

    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(screen.getByText('There are no items to display')).toBeInTheDocument();
  });

  it('should render action button when provided', () => {
    const mockAction = vi.fn();

    render(
      <EmptyState
        icon={Inbox}
        title="No items found"
        description="There are no items to display"
        action={{ label: 'Add Item', onClick: mockAction }}
      />
    );

    const button = screen.getByRole('button', { name: 'Add Item' });
    expect(button).toBeInTheDocument();
  });

  it('should call action onClick when button is clicked', async () => {
    const mockAction = vi.fn();
    const user = userEvent.setup();

    render(
      <EmptyState
        icon={Inbox}
        title="No items found"
        description="There are no items to display"
        action={{ label: 'Add Item', onClick: mockAction }}
      />
    );

    const button = screen.getByRole('button', { name: 'Add Item' });
    await user.click(button);

    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('should not render action button when not provided', () => {
    render(
      <EmptyState
        icon={Inbox}
        title="No items found"
        description="There are no items to display"
      />
    );

    const button = screen.queryByRole('button');
    expect(button).not.toBeInTheDocument();
  });

  it('should render icon component', () => {
    const { container } = render(
      <EmptyState
        icon={Inbox}
        title="No items found"
        description="There are no items to display"
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
