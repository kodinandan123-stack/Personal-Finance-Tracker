import { useEffect, useState } from 'react';

/**
 * useWindowSize
 * Tracks the browser window's width and height, updating on resize.
 * Handy for building responsive dashboard layouts and charts.
 *
 * @returns {{ width: number, height: number }}
 */
function useWindowSize() {
    const [size, setSize] = useState({
          width: window.innerWidth,
          height: window.innerHeight,
    });

  useEffect(() => {
        function handleResize() {
                setSize({ width: window.innerWidth, height: window.innerHeight });
        }

                window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

export default useWindowSize;
