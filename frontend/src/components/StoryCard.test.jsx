import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import StoryCard from './StoryCard';

const story = {
  id: 7,
  slug: 'demo-story',
  title: 'Demo Story',
  description: 'A story for tests.',
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
    expect(screen.getByText(/12 chương/i)).toBeInTheDocument();
    expect(screen.getByText(/4 theo dõi/i)).toBeInTheDocument();
  });

  it('renders in compact mode without crashing', () => {
    render(
      <MemoryRouter>
        <StoryCard story={story} compact />
      </MemoryRouter>
    );

    expect(screen.getAllByRole('link', { name: 'Demo Story' })[0]).toHaveAttribute('href', '/story/7-demo-story');
  });
});
