'use client';

import { useState, useEffect, useCallback } from 'react';
import './ThemeToggle.css';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('aichat_theme');
    if (saved === 'dark') {
      setDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.setAttribute(
        'data-theme',
        next ? 'dark' : 'light'
      );
      localStorage.setItem('aichat_theme', next ? 'dark' : 'light');
      return next;
    });
  }, []);

  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0-3a1 1 0 0 0 1-1V1a1 1 0 1 0-2 0v2a1 1 0 0 0 1 1zm0 16a1 1 0 0 0-1 1v2a1 1 0 1 0 2 0v-2a1 1 0 0 0-1-1zm9-9h-2a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2zM4 11H2a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2zm15.07-5.66l-1.41 1.41a1 1 0 1 0 1.41 1.41l1.41-1.41a1 1 0 0 0-1.41-1.41zM5.34 17.24l-1.41 1.41a1 1 0 0 0 1.41 1.41l1.41-1.41a1 1 0 0 0-1.41-1.41zm12.73 0a1 1 0 0 0-1.41 1.41l1.41 1.41a1 1 0 0 0 1.41-1.41l-1.41-1.41zM6.75 5.34a1 1 0 0 0 0-1.41L5.34 2.52a1 1 0 1 0-1.41 1.41l1.41 1.41a1 1 0 0 0 1.41 0z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.39 5.39 0 0 1-4.4 2.26 5.4 5.4 0 0 1-3.82-1.58A5.4 5.4 0 0 1 11.1 7.5c0-1.65.74-3.22 2.04-4.4A9.08 9.08 0 0 0 12 3z" />
        </svg>
      )}
    </button>
  );
}
