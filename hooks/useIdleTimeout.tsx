import { useState, useEffect, useRef, useCallback } from 'react';

interface IdleTimeoutProps {
  onIdle: () => void;
  idleTime: number; // in seconds
  warningTime: number; // in seconds
}

export const useIdleTimeout = ({ onIdle, idleTime, warningTime }: IdleTimeoutProps) => {
  const [isIdle, setIsIdle] = useState(false);
  const [remainingTime, setRemainingTime] = useState(warningTime);
  
  const idleTimer = useRef<number | null>(null);
  const warningTimer = useRef<number | null>(null);
  const countdownInterval = useRef<number | null>(null);

  const resetTimers = useCallback(() => {
    // Clear existing timers
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);

    // Reset state
    setIsIdle(false);
    setRemainingTime(warningTime);

    // Set new timers
    warningTimer.current = window.setTimeout(() => {
        setIsIdle(true);
        // Start countdown
        countdownInterval.current = window.setInterval(() => {
            setRemainingTime(prev => prev - 1);
        }, 1000);
    }, (idleTime - warningTime) * 1000);

    idleTimer.current = window.setTimeout(() => {
      onIdle();
    }, idleTime * 1000);
  }, [onIdle, idleTime, warningTime]);

  // Event handler for user activity
  const handleActivity = useCallback(() => {
    resetTimers();
  }, [resetTimers]);

  // Function to be called by the modal button to stay active
  const stayActive = () => {
    handleActivity();
  };

  // Set up event listeners
  useEffect(() => {
    handleActivity(); // Initialize timers on mount

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, handleActivity));

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [handleActivity]);

  // Effect to handle logout when countdown reaches zero
  useEffect(() => {
    if (remainingTime <= 0 && isIdle) {
      onIdle();
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    }
  }, [remainingTime, isIdle, onIdle]);


  return { isIdle, remainingTime, stayActive };
};
