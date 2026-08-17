'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('pes6_theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('pes6_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  if (!mounted) {
    return <div style={{ width: '44px', height: '24px' }}></div>;
  }

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-btn"
      title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
      aria-label="Cambiar tema"
    >
      <div className={`theme-toggle-track ${theme}`}>
        <div className="theme-toggle-thumb">
          {theme === 'dark' ? '🌙' : '☀️'}
        </div>
      </div>
    </button>
  );
}
