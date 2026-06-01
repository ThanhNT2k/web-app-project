import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import authService from '../services/authService';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (username: string, email: string, password: string, fullName: string) => Promise<User>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(authService.getCurrentUser());
    };

    handleAuthChange();
    window.addEventListener('auth-changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login: async (email, password) => {
        const nextUser = await authService.login(email, password);
        setUser(nextUser);
        return nextUser;
      },
      register: async (username, email, password, fullName) => {
        const nextUser = await authService.register(username, email, password, fullName);
        setUser(nextUser);
        return nextUser;
      },
      logout: async () => {
        await authService.logout();
        setUser(null);
      },
      hasRole: (role) => Boolean(user && user.role === role),
      refreshUser: () => setUser(authService.getCurrentUser()),
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}