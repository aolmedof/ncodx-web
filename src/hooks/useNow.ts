import { useSyncExternalStore } from 'react';

/**
 * Current time, read through an external store so render stays pure.
 * The snapshot is rounded to the minute, which keeps it referentially stable
 * within that minute (React re-reads getSnapshot on every render and would
 * loop if it changed each time), and re-renders consumers once a minute.
 */
function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
}

const getSnapshot = () => Math.floor(Date.now() / 60_000) * 60_000;

export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
