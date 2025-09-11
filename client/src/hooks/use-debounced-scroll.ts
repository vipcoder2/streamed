import { useEffect, useCallback, useRef } from 'react';

interface UseDeboucedScrollOptions {
  delay?: number;
  threshold?: number;
}

export function useDebouncedScroll(
  callback: () => void,
  enabled: boolean = true,
  options: UseDeboucedScrollOptions = {}
) {
  const { delay = 100, threshold = 5 } = options;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  
  // Update callback ref when callback changes
  callbackRef.current = callback;

  const handleScroll = useCallback(() => {
    if (!enabled || window.innerWidth >= 768) return; // Only on mobile
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      const scrollTop = document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      
      if (scrollTop + clientHeight >= scrollHeight - threshold) {
        callbackRef.current();
      }
    }, delay);
  }, [enabled, delay, threshold]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleScroll]);
}