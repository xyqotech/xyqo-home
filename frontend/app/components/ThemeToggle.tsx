'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeContext } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useThemeContext();

  const themes = [
    { value: 'auto' as const, label: 'Auto', icon: '🌓' },
    { value: 'light' as const, label: 'Clair', icon: '☀️' },
    { value: 'dark' as const, label: 'Sombre', icon: '🌙' }
  ];

  return (
    <div className="relative">
      <div className="flex items-center bg-white/10 backdrop-blur-lg rounded-lg p-1 border border-white/20">
        {themes.map((themeOption) => (
          <button
            key={themeOption.value}
            onClick={() => setTheme(themeOption.value)}
            className={`relative px-3 py-1.5 text-xs font-medium transition-all duration-200 rounded-md ${
              theme === themeOption.value
                ? 'text-white'
                : 'text-white/60 hover:text-white/80'
            }`}
            aria-label={`Basculer vers le thème ${themeOption.label}`}
          >
            <AnimatePresence>
              {theme === themeOption.value && (
                <motion.div
                  layoutId="theme-indicator"
                  className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 to-violet-500/30 rounded-md border border-indigo-400/30"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </AnimatePresence>
            <span className="relative flex items-center space-x-1">
              <span>{themeOption.icon}</span>
              <span>{themeOption.label}</span>
            </span>
          </button>
        ))}
      </div>
      
      {/* Status indicator */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="text-xs text-white/50 whitespace-nowrap">
          Actuel: {resolvedTheme === 'dark' ? '🌙' : '☀️'}
        </div>
      </div>
    </div>
  );
}
