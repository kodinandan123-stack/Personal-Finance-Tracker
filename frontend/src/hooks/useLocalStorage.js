import { useState, useEffect } from 'react';

/**
 * Persists a stateful value in localStorage.
 *
 * Behaves like useState, but reads the initial value from
 * localStorage (when available) and writes any updates back so
 * the value survives page reloads. Useful for user preferences
 * such as the selected currency or active filters.
 *
 * @param {string} key - The localStorage key to read/write.
 * @param {*} initialValue - Fallback value when nothing is stored.
 * @returns {[*, Function]} A [value, setValue] tuple like useState.
 */
export default function useLocalStorage(key, initialValue) {
  const readValue = () => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`useLocalStorage: could not read key "${key}"`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState(readValue);

  const setValue = (value) => {
    setStoredValue((prev) => {
      const next = value instanceof Function ? value(prev) : value;
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch (error) {
        console.warn(`useLocalStorage: could not write key "${key}"`, error);
      }
      return next;
    });
  };

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === key) setStoredValue(readValue());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [storedValue, setValue];
}
