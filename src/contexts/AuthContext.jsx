import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import API from '../services/api';
import authService from '../services/authService';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [token, setToken] = useState(() => authService.getToken());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initializeUser = async () => {
      if (!authService.isAuthenticated()) {
        return;
      }

      try {
        setLoading(true);
        const response = await API.auth.getCurrentUser();
        setUser(response.user || null);
      } catch {
        // Keep the local fallback user if the backend is unavailable.
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  const login = async (email, password) => {
    const currentUser = await authService.login(email, password);
    setUser(currentUser);
    setToken(authService.getToken());
    return currentUser;
  };

  const register = async (username, email, password, fullName) => {
    const currentUser = await authService.register(username, email, password, fullName);
    setUser(currentUser);
    setToken(authService.getToken());
    return currentUser;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
      setUser,
      refreshCurrentUser: async () => {
        const response = await API.auth.getCurrentUser();
        setUser(response.user || null);
        return response.user || null;
      },
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export { AuthProvider, useAuth };