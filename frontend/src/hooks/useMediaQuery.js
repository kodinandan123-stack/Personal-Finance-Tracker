import { useEffect, useState } from 'react';

/**
 * Tracks whether a CSS media query currently matches.
 *
 * Useful for responsive behaviour that can't be expressed with
 * CSS alone, such as rendering a compact chart on small screens
 * or collapsing the sidebar on mobile.
 *
 * @param {string} query - A media query string, e.g. '(max-width: 768px)'.
 * @returns {boolean} Whether the query currently matches.
 */
export default function useMediaQuery(query) {
  const getMatch = () =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(query).matches
      : false;

  const [matches, setMatches] = useState(getMatch);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const mediaQueryList = window.matchMedia(query);
    const handleChange = (event) => setMatches(event.matches);

    // Sync immediately in case the query changed between renders.
    setMatches(mediaQueryList.matches);

    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handleChange);
      return () => mediaQueryList.removeEventListener('change', handleChange);
    }

    // Fallback for older Safari versions.
    mediaQueryList.addListener(handleChange);
    return () => mediaQueryList.removeListener(handleChange);
  }, [query]);

  return matches;
}
