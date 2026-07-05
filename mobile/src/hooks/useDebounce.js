import { useState, useEffect } from 'react'

/**
   * Debounces a rapidly changing value.
   *
   * Mobile port of the web app's useDebounce hook (frontend/src/hooks/useDebounce.js).
   * Useful for search and filter inputs so that expensive work (such as API
   * calls) only runs after the user stops typing/interacting.
   *
   * @param {*} value - The value to debounce.
   * @param {number} delay - Delay in milliseconds (default 300).
   * @returns {*} The debounced value.
   */
export default function useDebounce(value, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay)
        return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
