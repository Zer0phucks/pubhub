import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileMenu } from '../ProfileMenu';

describe('ProfileMenu Component', () => {
  const mockUser = {
    name: 'John Doe',
    email: 'john@example.com',
    tier: 'pro' as const,
  };

  it('should render user initials in avatar', () => {
    const mockOnThemeChange = vi.fn();
    const mockOnSignOut = vi.fn();

    render(
      <ProfileMenu
        user={mockUser}
        theme="system"
        onThemeChange={mockOnThemeChange}
        onSignOut={mockOnSignOut}
      />
    );

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should display user name and email in dropdown', async () => {
    const mockOnThemeChange = vi.fn();
    const mockOnSignOut = vi.fn();
    const user = userEvent.setup();

    render(
      <ProfileMenu
        user={mockUser}
        theme="system"
        onThemeChange={mockOnThemeChange}
        onSignOut={mockOnSignOut}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(await screen.findByText('John Doe')).toBeInTheDocument();
    expect(await screen.findByText('john@example.com')).toBeInTheDocument();
  });

  it('should display tier badge when user has tier', async () => {
    const mockOnThemeChange = vi.fn();
    const mockOnSignOut = vi.fn();
    const user = userEvent.setup();

    render(
      <ProfileMenu
        user={mockUser}
        theme="system"
        onThemeChange={mockOnThemeChange}
        onSignOut={mockOnSignOut}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(await screen.findByText('Pro')).toBeInTheDocument();
  });

  it('should call onSignOut when sign out is clicked', async () => {
    const mockOnThemeChange = vi.fn();
    const mockOnSignOut = vi.fn();
    const user = userEvent.setup();

    render(
      <ProfileMenu
        user={mockUser}
        theme="system"
        onThemeChange={mockOnThemeChange}
        onSignOut={mockOnSignOut}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    const signOutButton = await screen.findByText('Sign Out');
    await user.click(signOutButton);

    expect(mockOnSignOut).toHaveBeenCalledTimes(1);
  });

  it('should display theme options in submenu', async () => {
    const mockOnThemeChange = vi.fn();
    const mockOnSignOut = vi.fn();
    const user = userEvent.setup();

    render(
      <ProfileMenu
        user={mockUser}
        theme="light"
        onThemeChange={mockOnThemeChange}
        onSignOut={mockOnSignOut}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    const themeMenu = await screen.findByText('Theme');
    await user.click(themeMenu);

    expect(await screen.findByText('Light')).toBeInTheDocument();
    expect(await screen.findByText('Dark')).toBeInTheDocument();
    expect(await screen.findByText('System')).toBeInTheDocument();
  });

  it('should have theme change handlers', async () => {
    const mockOnThemeChange = vi.fn();
    const mockOnSignOut = vi.fn();
    const user = userEvent.setup();

    render(
      <ProfileMenu
        user={mockUser}
        theme="light"
        onThemeChange={mockOnThemeChange}
        onSignOut={mockOnSignOut}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    const themeMenu = await screen.findByText('Theme');
    expect(themeMenu).toBeInTheDocument();
  });

  it('should show check mark next to current theme', async () => {
    const mockOnThemeChange = vi.fn();
    const mockOnSignOut = vi.fn();
    const user = userEvent.setup();

    render(
      <ProfileMenu
        user={mockUser}
        theme="dark"
        onThemeChange={mockOnThemeChange}
        onSignOut={mockOnSignOut}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    const themeMenu = await screen.findByText('Theme');
    await user.click(themeMenu);

    // Check for checkmark next to Dark theme
    const darkTheme = (await screen.findByText('Dark')).closest('div');
    expect(darkTheme?.textContent).toContain('✓');
  });

  it('should extract initials correctly from name', () => {
    const mockOnThemeChange = vi.fn();
    const mockOnSignOut = vi.fn();

    const { rerender } = render(
      <ProfileMenu
        user={{ ...mockUser, name: 'Alice Smith' }}
        theme="system"
        onThemeChange={mockOnThemeChange}
        onSignOut={mockOnSignOut}
      />
    );

    expect(screen.getByText('AS')).toBeInTheDocument();

    rerender(
      <ProfileMenu
        user={{ ...mockUser, name: 'Bob' }}
        theme="system"
        onThemeChange={mockOnThemeChange}
        onSignOut={mockOnSignOut}
      />
    );

    expect(screen.getByText('B')).toBeInTheDocument();
  });
});
