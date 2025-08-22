'use client';

import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'auto';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeConfig {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export function useTheme(): ThemeConfig {
  const [theme, setThemeState] = useState<Theme>('auto');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark');

  // Detect system preference
  const getSystemTheme = (): ResolvedTheme => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Detect ambient light (experimental - fallback to system)
  const detectAmbientLight = (): ResolvedTheme => {
    // Future: Use ambient light sensor API when available
    // For now, use time-based heuristic + system preference
    const hour = new Date().getHours();
    const isNightTime = hour < 7 || hour > 19;
    
    if (isNightTime) return 'dark';
    return getSystemTheme();
  };

  // Resolve theme based on setting
  const resolveTheme = (themeValue: Theme): ResolvedTheme => {
    switch (themeValue) {
      case 'light': return 'light';
      case 'dark': return 'dark';
      case 'auto': return detectAmbientLight();
      default: return 'dark';
    }
  };

  // Set theme with persistence
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('xyqo-theme', newTheme);
    
    const resolved = resolveTheme(newTheme);
    setResolvedTheme(resolved);
    
    // Apply to document
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  };

  // Toggle between light/dark (skip auto)
  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('xyqo-theme') as Theme || 'auto';
    const resolved = resolveTheme(savedTheme);
    
    setThemeState(savedTheme);
    setResolvedTheme(resolved);
    
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.classList.toggle('dark', resolved === 'dark');

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (savedTheme === 'auto') {
        const newResolved = resolveTheme('auto');
        setResolvedTheme(newResolved);
        document.documentElement.setAttribute('data-theme', newResolved);
        document.documentElement.classList.toggle('dark', newResolved === 'dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme
  };
}
