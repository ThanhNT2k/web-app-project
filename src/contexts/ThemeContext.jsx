import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const ThemeContext = createContext(null);

function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem('cmc_theme') === 'dark';
    } catch {
      return false;
    }
  });

  // Registry of callbacks that run whenever dark mode changes.
  // Used so that ReadingPreferencesPanel can sync the new value to the backend
  // regardless of *where* the toggle was triggered (Navbar or Settings panel).
  const darkModeListenersRef = useRef(new Set());

  const registerDarkModeListener = useCallback((fn) => {
    darkModeListenersRef.current.add(fn);
    return () => darkModeListenersRef.current.delete(fn);
  }, []);

  useEffect(() => {
    const theme = isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', isDarkMode);
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('cmc_theme', theme);

    // Notify all registered listeners (e.g. ReadingPreferencesPanel -> server sync)
    darkModeListenersRef.current.forEach((fn) => fn(isDarkMode));
  }, [isDarkMode]);

  const value = useMemo(
    () => ({
      isDarkMode,
      setIsDarkMode,
      toggleDarkMode: () => setIsDarkMode((v) => !v),
      registerDarkModeListener,
    }),
    [isDarkMode, registerDarkModeListener]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

export { ThemeProvider, useTheme };
