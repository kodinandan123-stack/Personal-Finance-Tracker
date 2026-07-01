import { useEffect, useState } from 'react';

const STORAGE_KEY = 'pft-dark-mode';

/**
 * DarkModeToggle
 *
 * Reads/writes the user's dark-mode preference to localStorage and toggles
 * the "dark" class on <html> so Tailwind's dark-mode utilities activate.
 */
export default function DarkModeToggle() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY, String(dark));
  }, [dark]);

  return (
    <button
      onClick={() => setDark((prev) => !prev)}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="
        flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
        border transition-colors duration-200
        bg-white dark:bg-gray-800
        border-gray-200 dark:border-gray-600
        text-gray-700 dark:text-gray-200
        hover:bg-gray-100 dark:hover:bg-gray-700
      "
    >
      <span className="text-base" aria-hidden="true">
        {dark ? '☀️' : '🌙'}
      </span>
      <span className="hidden sm:inline">{dark ? 'Light' : 'Dark'}</span>
    </button>
  );
}
