import { useEffect, useRef } from 'react';

/**
 * Custom hook for auto-saving data with debouncing
 *
 * @param {Function} saveFunction - Function to call when saving
 * @param {Array} dependencies - Dependencies to watch for changes
 * @param {number} delay - Debounce delay in milliseconds (default: 1000)
 * @param {boolean} enabled - Whether auto-save is enabled (default: true)
 */
export const useAutoSave = (saveFunction, dependencies, delay = 1000, enabled = true) => {
  const timeoutRef = useRef(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    // Skip on initial mount
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    // Skip if not enabled
    if (!enabled) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      saveFunction();
    }, delay);

    // Cleanup on unmount or dependency change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
};

export default useAutoSave;
