import { useEffect, useRef } from 'react';

/**
 * useClickOutside
 * Calls the provided handler when a click/touch occurs outside the
 * referenced element. Useful for closing dropdowns, modals, and menus.
 *
 * @param {Function} handler - callback invoked on outside click
 * @returns {React.RefObject} ref to attach to the target element
 */
function useClickOutside(handler) {
    const ref = useRef(null);

  useEffect(() => {
        function handleEvent(event) {
                if (ref.current && !ref.current.contains(event.target)) {
                          handler(event);
                }
        }

                document.addEventListener('mousedown', handleEvent);
        document.addEventListener('touchstart', handleEvent);

                return () => {
                        document.removeEventListener('mousedown', handleEvent);
                        document.removeEventListener('touchstart', handleEvent);
                };
  }, [handler]);

  return ref;
}

export default useClickOutside;
