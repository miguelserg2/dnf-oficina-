import { useState, useEffect, useRef, useCallback } from 'react';

type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved';

interface AutosaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<any> | void;
  interval?: number;
}

// FIX: Added a trailing comma to the generic type parameter <T> to disambiguate it from a JSX tag.
export const useAutosave = <T,>({ data, onSave, interval = 2000 }: AutosaveOptions<T>): [SaveStatus, () => Promise<void>] => {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const timer = useRef<number | null>(null);
  const previousData = useRef(JSON.stringify(data));
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;
  
  const isMounted = useRef(false);

  const triggerHapticFeedback = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50); // 50ms vibration
    }
  };

  useEffect(() => {
    // Don't run on mount
    if (!isMounted.current) {
        isMounted.current = true;
        // Sync previousData with initial data
        previousData.current = JSON.stringify(data);
        return;
    }

    const currentDataString = JSON.stringify(data);
    if (previousData.current === currentDataString) {
      return;
    }

    if (timer.current) {
      clearTimeout(timer.current);
    }
    
    setStatus('unsaved');
    
    timer.current = window.setTimeout(async () => {
      setStatus('saving');
      await onSaveRef.current(data);
      previousData.current = JSON.stringify(data);
      setStatus('saved');
      triggerHapticFeedback();
      
      window.setTimeout(() => setStatus('idle'), 2000);

    }, interval);

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [data, interval]);

  const saveNow = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    setStatus('saving');
    await onSaveRef.current(data);
    previousData.current = JSON.stringify(data);
    setStatus('saved');
    triggerHapticFeedback();
    window.setTimeout(() => setStatus('idle'), 2000);
  }, [data, onSaveRef]);

  return [status, saveNow];
};