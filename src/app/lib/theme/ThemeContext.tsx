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
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    
    // Check user preference if no saved theme
    if (!savedTheme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
      localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
    } else {
      setTheme(savedTheme);
    }
    setMounted(true);
  }, []);

  // This effect updates the DOM when theme changes
  useEffect(() => {
    if (mounted) {
      console.log('Applying theme:', theme);
      
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
      
      // Force a repaint by adding/removing a utility class
      document.body.classList.add('theme-updated');
      document.body.style.opacity = '0.99';
      setTimeout(() => {
        document.body.classList.remove('theme-updated');
        document.body.style.opacity = '1';
      }, 100);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log(`Toggling theme from ${theme} to ${newTheme}`);
    setTheme(newTheme);
  };

  // Prevent flash of wrong theme by hiding content until mounted
  if (!mounted) {
    return <>{children}</>;
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
  } catch (e) {
    return 'light';
  }
};

const defaultToggleTheme = () => {
  if (typeof window === 'undefined') return;
  
  try {
    const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const newTheme = current === 'dark' ? 'light' : 'dark';
    
    console.log(`Fallback toggling theme from ${current} to ${newTheme}`);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    
    localStorage.setItem('theme', newTheme);
    
    // Force a repaint
    document.body.classList.add('theme-updated');
    document.body.style.opacity = '0.99';
    setTimeout(() => {
      document.body.classList.remove('theme-updated');
      document.body.style.opacity = '1';
    }, 100);
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