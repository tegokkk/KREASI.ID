import { useEffect } from 'react';

/**
 * Resets ephemeral activity state when a browser restores a page from history cache (bfcache).
 */
export function useEphemeralReset(onReset) {
  useEffect(() => {
    function handlePageShow(event) {
      if (event.persisted) {
        onReset();
      }
    }

    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [onReset]);
}
