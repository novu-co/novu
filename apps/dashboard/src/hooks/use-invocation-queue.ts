import { useCallback, useRef } from 'react';

type CallbackFunction = () => Promise<unknown>;

export function useInvocationQueue<T extends CallbackFunction = CallbackFunction>({
  debounceInMs = 200,
  waitingRoom = Number.MAX_SAFE_INTEGER,
} = {}) {
  const queueRef = useRef<T[]>([]); // Queue to hold pending saves
  const isSavingRef = useRef(false); // Flag to track if a save is in-flight
  const debounceTimerRef = useRef<number | null>(null); // Timer for debouncing

  const processQueue = useCallback(async () => {
    if (isSavingRef.current || queueRef.current.length === 0) {
      return; // Return if a save is already in-flight or the queue is empty
    }

    isSavingRef.current = true;

    while (queueRef.current.length > 0) {
      let nextInvocation;

      if (queueRef.current.length >= waitingRoom) {
        nextInvocation = queueRef.current.pop(); // Get the last item from the queue
        queueRef.current = []; // Clear the queue
      } else {
        nextInvocation = queueRef.current.shift(); // Get the next item in the queue
      }

      if (nextInvocation) {
        await nextInvocation(); // Execute the next autosave function
      }
    }

    isSavingRef.current = false;
  }, [waitingRoom]);

  const enqueue = useCallback(
    (data: T) => {
      // Clear previous debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set a new debounce timer
      debounceTimerRef.current = setTimeout(() => {
        queueRef.current.push(data);
        processQueue(); // Trigger queue processing
      }, debounceInMs) as any;
    },
    [debounceInMs, processQueue]
  );

  return {
    enqueue,
  };
}
