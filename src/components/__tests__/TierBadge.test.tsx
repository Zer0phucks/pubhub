import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TierBadge } from '../TierBadge';

describe('TierBadge Component', () => {
  it('should render free tier badge', () => {
    render(<TierBadge tier="free" />);
    const badge = screen.getByText(/free/i);
    expect(badge).toBeInTheDocument();
  });

  it('should render basic tier badge', () => {
    render(<TierBadge tier="basic" />);
    const badge = screen.getByText(/basic/i);
    expect(badge).toBeInTheDocument();
  });

  it('should render pro tier badge', () => {
    render(<TierBadge tier="pro" />);
    const badge = screen.getByText(/pro/i);
    expect(badge).toBeInTheDocument();
  });

  it('should render without icon when showIcon is false', () => {
    const { container } = render(<TierBadge tier="free" showIcon={false} />);
    const badge = screen.getByText(/free/i);
    expect(badge).toBeInTheDocument();
    // Icon should not be present
    const svg = container.querySelector('svg');
    expect(svg).not.toBeInTheDocument();
  });

  it('should render with icon by default', () => {
    const { container } = render(<TierBadge tier="free" />);
    const badge = screen.getByText(/free/i);
    expect(badge).toBeInTheDocument();
    // Icon should be present
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should apply correct styling for each tier', () => {
    const { rerender } = render(<TierBadge tier="free" />);
    let badge = screen.getByText(/free/i);
    expect(badge).toHaveClass('bg-gray-100');

    rerender(<TierBadge tier="basic" />);
    badge = screen.getByText(/basic/i);
    expect(badge).toHaveClass('bg-blue-100');

    rerender(<TierBadge tier="pro" />);
    badge = screen.getByText(/pro/i);
    expect(badge).toHaveClass('bg-gradient-to-r');
  });
});
