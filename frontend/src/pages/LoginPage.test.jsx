import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import LoginPage from './LoginPage';
import { useAuth } from '../contexts/AuthContext';

const navigate = vi.fn();

vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../components/GoogleLoginButton', () => ({
  default: () => <button type="button">Google login</button>,
}));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

function renderLogin(initialEntry = '/login') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ login: vi.fn(), loginWithGoogle: vi.fn() });
  });

  it('provides semantic email/password inputs and a submit button', () => {
    renderLogin();
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
    expect(document.querySelector('input[name="password"]')).toHaveAttribute('type', 'password');
    expect(document.querySelector('button[type="submit"]')).toBeEnabled();
  });

  it('submits once while loading and routes a reader home', async () => {
    let finishLogin;
    const login = vi.fn(() => new Promise((resolve) => { finishLogin = resolve; }));
    useAuth.mockReturnValue({ login, loginWithGoogle: vi.fn() });
    renderLogin();

    fireEvent.change(document.querySelector('input[name="email"]'), {
      target: { value: 'reader@example.com' },
    });
    fireEvent.change(document.querySelector('input[name="password"]'), {
      target: { value: 'Password1!' },
    });
    fireEvent.click(document.querySelector('button[type="submit"]'));
    fireEvent.click(document.querySelector('button[type="submit"]'));

    expect(login).toHaveBeenCalledTimes(1);
    expect(document.querySelector('button[type="submit"]')).toBeDisabled();
    finishLogin({ role: 'User' });
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/'));
  });

  it.each([
    ['Admin', '/admin'],
    ['Moderator', '/moderator/dashboard'],
  ])('routes %s to its management area', async (role, target) => {
    const login = vi.fn().mockResolvedValue({ role });
    useAuth.mockReturnValue({ login, loginWithGoogle: vi.fn() });
    renderLogin();
    fireEvent.change(document.querySelector('input[name="email"]'), {
      target: { value: 'role@example.com' },
    });
    fireEvent.change(document.querySelector('input[name="password"]'), {
      target: { value: 'Password1!' },
    });
    fireEvent.submit(document.querySelector('form'));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith(target));
  });

  it('shows the API error and re-enables submit after a failed login', async () => {
    const login = vi.fn().mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } },
    });
    useAuth.mockReturnValue({ login, loginWithGoogle: vi.fn() });
    renderLogin();
    fireEvent.change(document.querySelector('input[name="email"]'), {
      target: { value: 'reader@example.com' },
    });
    fireEvent.change(document.querySelector('input[name="password"]'), {
      target: { value: 'wrong' },
    });
    fireEvent.submit(document.querySelector('form'));
    expect(await screen.findByText('Invalid credentials')).toHaveClass('alert-danger');
    expect(document.querySelector('button[type="submit"]')).toBeEnabled();
  });
});
