import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import StoryCard from './StoryCard';

const story = {
  id: 7,
  slug: 'demo-story',
  title: 'Demo Story',
  description: 'A story for tests.',
  author_name: 'Test Author',
  author_username: 'tester',
  chapter_count: 12,
  follow_count: 4,
  average_rating: 4.5,
  rating_count: 2,
  tags: [{ name: 'Fantasy' }, 'Action'],
};

describe('StoryCard', () => {
  it('renders story metadata and links to the story detail page', () => {
    render(
      <MemoryRouter>
        <StoryCard story={story} />
      </MemoryRouter>
    );

    expect(screen.getAllByRole('link', { name: 'Demo Story' })[0]).toHaveAttribute('href', '/story/7-demo-story');
    expect(screen.getByText('Fantasy')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
    expect(screen.getByText(/12 chương/i)).toBeInTheDocument();
    expect(screen.getByText(/4 theo dõi/i)).toBeInTheDocument();
  });

  it('applies compact class and still renders story link in compact mode', () => {
    const { container } = render(
      <MemoryRouter>
        <StoryCard story={story} compact />
      </MemoryRouter>
    );

    expect(screen.getAllByRole('link', { name: 'Demo Story' })[0]).toHaveAttribute('href', '/story/7-demo-story');
    expect(container.querySelector('.story-card-compact')).toBeInTheDocument();
  });
});
