import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ProtectedRoute from './ProtectedRoute';
import RoleProtectedRoute from './RoleProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

function renderWithRoutes(element, initialPath = '/private') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/private" element={element} />
        <Route path="/login" element={<div>Login page</div>} />
        <Route path="/" element={<div>Home page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children for authenticated users', () => {
    useAuth.mockReturnValue({ isAuthenticated: true });

    renderWithRoutes(
      <ProtectedRoute>
        <div>Private content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Private content')).toBeInTheDocument();
  });

  it('redirects anonymous users to login', () => {
    useAuth.mockReturnValue({ isAuthenticated: false });

    renderWithRoutes(
      <ProtectedRoute>
        <div>Private content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Login page')).toBeInTheDocument();
  });
});

describe('RoleProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when the user has an allowed role', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { role: 'Admin' },
    });

    renderWithRoutes(
      <RoleProtectedRoute allowedRoles={['Admin']}>
        <div>Admin content</div>
      </RoleProtectedRoute>
    );

    expect(screen.getByText('Admin content')).toBeInTheDocument();
  });

  it('redirects authenticated users with the wrong role to home', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { role: 'User' },
    });

    renderWithRoutes(
      <RoleProtectedRoute allowedRoles={['Admin']}>
        <div>Admin content</div>
      </RoleProtectedRoute>
    );

    expect(screen.getByText('Home page')).toBeInTheDocument();
  });
});
