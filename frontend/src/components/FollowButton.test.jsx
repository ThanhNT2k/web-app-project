import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import FollowButton from './FollowButton';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';

vi.mock('../services/api', () => ({
  default: {
    follows: {
      check: vi.fn(),
      follow: vi.fn(),
      unfollow: vi.fn(),
    },
  },
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('FollowButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('asks anonymous users to log in before following', () => {
    useAuth.mockReturnValue({ isAuthenticated: false });

    render(<FollowButton storyId={7} />);
    fireEvent.click(screen.getByRole('button'));

    expect(window.alert).toHaveBeenCalled();
    expect(API.follows.follow).not.toHaveBeenCalled();
  });

  it('checks follow status and unfollows when already following', async () => {
    useAuth.mockReturnValue({ isAuthenticated: true });
    API.follows.check.mockResolvedValue({ following: true });
    API.follows.unfollow.mockResolvedValue({});

    render(<FollowButton storyId={7} />);

    await waitFor(() => expect(API.follows.check).toHaveBeenCalledWith(7));
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(API.follows.unfollow).toHaveBeenCalledWith(7));
  });

  it('follows when the user is not following yet', async () => {
    useAuth.mockReturnValue({ isAuthenticated: true });
    API.follows.check.mockResolvedValue({ following: false });
    API.follows.follow.mockResolvedValue({});

    render(<FollowButton storyId={7} />);

    await waitFor(() => expect(API.follows.check).toHaveBeenCalledWith(7));
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(API.follows.follow).toHaveBeenCalledWith(7));
  });

  it('updates immediately and rolls back when the request fails', async () => {
    useAuth.mockReturnValue({ isAuthenticated: true });
    API.follows.check.mockResolvedValue({ following: false });
    API.follows.follow.mockRejectedValue(new Error('network error'));

    render(<FollowButton storyId={7} />);
    await waitFor(() => expect(API.follows.check).toHaveBeenCalledWith(7));
    await screen.findByTitle('Theo dõi truyện');

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByTitle('Bỏ theo dõi truyện')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTitle('Theo dõi truyện')).toBeInTheDocument();
    });
  });
});
