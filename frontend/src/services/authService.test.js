import { beforeEach, describe, expect, it, vi } from 'vitest';

import authService from './authService';
import API from './api';

vi.mock('./api', () => ({
  default: {
    auth: {
      register: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
    },
  },
}));

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('logs in and stores token and user data', async () => {
    API.auth.login.mockResolvedValue({
      token: 'token-123',
      user: { id: 1, role: 'User' },
    });

    const user = await authService.login('reader@example.com', 'Password1!');

    expect(API.auth.login).toHaveBeenCalledWith({
      email: 'reader@example.com',
      password: 'Password1!',
    });
    expect(user).toEqual({ id: 1, role: 'User' });
    expect(authService.getToken()).toBe('token-123');
    expect(authService.isAuthenticated()).toBe(true);
  });

  it('clears auth data even when server logout fails', async () => {
    authService.saveAuthData('token-123', { id: 1, role: 'User' });
    API.auth.logout.mockRejectedValue(new Error('network down'));

    await authService.logout();

    expect(authService.getToken()).toBeNull();
    expect(authService.getCurrentUser()).toBeNull();
  });

  it('checks single and multiple roles from stored user data', () => {
    authService.saveAuthData('token-123', { id: 1, role: 'Admin' });

    expect(authService.hasRole('Admin')).toBe(true);
    expect(authService.hasRole(['Moderator', 'Admin'])).toBe(true);
    expect(authService.hasRole('User')).toBe(false);
  });
});
