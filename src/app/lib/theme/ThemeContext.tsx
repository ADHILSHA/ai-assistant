'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Start with a default theme (matching system is best practice)
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // This first effect only runs once on mount to avoid hydration mismatch
  useEffect(() => {
    // Check for saved theme in localStorage
    try {
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      
      // Check user preference if no saved theme
      if (!savedTheme) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
        localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
      } else {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error('Error accessing localStorage for theme:', error);
    }
    
    setMounted(true);
  }, []);

  // This effect updates the DOM when theme changes
  useEffect(() => {
    if (mounted) {
      try {
        // Apply theme class to html element
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.setAttribute('data-theme', 'light');
        }
        
        // Save to localStorage
        localStorage.setItem('theme', theme);
      } catch (error) {
        console.error('Error applying theme:', error);
      }
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    try {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
    } catch (error) {
      console.error('Error toggling theme:', error);
    }
  };

  // Prevent flash of wrong theme by hiding content until mounted
  // Return a simple div to avoid hydration mismatches
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Create a standalone fallback implementation
const getDefaultTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  
  try {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

const defaultToggleTheme = () => {
  if (typeof window === 'undefined') return;
  
  try {
    const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const newTheme = current === 'dark' ? 'light' : 'dark';
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    
    localStorage.setItem('theme', newTheme);
  } catch (e) {
    console.error('Error toggling theme:', e);
  }
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    // Return fallback implementation instead of throwing an error
    return {
      theme: getDefaultTheme(),
      toggleTheme: defaultToggleTheme
    };
  }
  
  return context;
} 