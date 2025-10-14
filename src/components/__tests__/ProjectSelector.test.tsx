import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectSelector } from '../ProjectSelector';

describe('ProjectSelector Component', () => {
  const mockProjects = [
    { id: '1', name: 'Project 1', icon: '🚀' },
    { id: '2', name: 'Project 2', icon: '📱' },
    { id: '3', name: 'Project 3' },
  ];

  it('should render current project name', () => {
    const mockOnSelect = vi.fn();
    const mockOnCreate = vi.fn();

    render(
      <ProjectSelector
        projects={mockProjects}
        currentProject={mockProjects[0]}
        onSelectProject={mockOnSelect}
        onCreateNew={mockOnCreate}
      />
    );

    expect(screen.getByText('Project 1')).toBeInTheDocument();
  });

  it('should show "Select Project" when no current project', () => {
    const mockOnSelect = vi.fn();
    const mockOnCreate = vi.fn();

    render(
      <ProjectSelector
        projects={mockProjects}
        currentProject={null}
        onSelectProject={mockOnSelect}
        onCreateNew={mockOnCreate}
      />
    );

    expect(screen.getByText('Select Project')).toBeInTheDocument();
  });

  it('should display project icon when available', () => {
    const mockOnSelect = vi.fn();
    const mockOnCreate = vi.fn();

    render(
      <ProjectSelector
        projects={mockProjects}
        currentProject={mockProjects[0]}
        onSelectProject={mockOnSelect}
        onCreateNew={mockOnCreate}
      />
    );

    expect(screen.getByText('🚀')).toBeInTheDocument();
  });

  it('should call onSelectProject when a project is clicked', async () => {
    const mockOnSelect = vi.fn();
    const mockOnCreate = vi.fn();
    const user = userEvent.setup();

    render(
      <ProjectSelector
        projects={mockProjects}
        currentProject={mockProjects[0]}
        onSelectProject={mockOnSelect}
        onCreateNew={mockOnCreate}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    // Find and click Project 2
    const project2 = await screen.findByText('Project 2');
    await user.click(project2);

    expect(mockOnSelect).toHaveBeenCalledWith(mockProjects[1]);
  });

  it('should call onCreateNew when "Create New Project" is clicked', async () => {
    const mockOnSelect = vi.fn();
    const mockOnCreate = vi.fn();
    const user = userEvent.setup();

    render(
      <ProjectSelector
        projects={mockProjects}
        currentProject={mockProjects[0]}
        onSelectProject={mockOnSelect}
        onCreateNew={mockOnCreate}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    const createButton = await screen.findByText('Create New Project');
    await user.click(createButton);

    expect(mockOnCreate).toHaveBeenCalledTimes(1);
  });

  it('should display all projects in dropdown', async () => {
    const mockOnSelect = vi.fn();
    const mockOnCreate = vi.fn();
    const user = userEvent.setup();

    render(
      <ProjectSelector
        projects={mockProjects}
        currentProject={mockProjects[0]}
        onSelectProject={mockOnSelect}
        onCreateNew={mockOnCreate}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    // Use getAllByText since Project 1 appears both in button and dropdown
    const project1Items = await screen.findAllByText('Project 1');
    expect(project1Items.length).toBeGreaterThan(0);

    expect(await screen.findByText('Project 2')).toBeInTheDocument();
    expect(await screen.findByText('Project 3')).toBeInTheDocument();
  });
});
