/**
 * hooks/useOtpTimer.js — Countdown timer for OTP resend cooldown
 */

import { useState, useEffect, useCallback } from 'react';

const useOtpTimer = (initialSeconds = 60) => {
  const [secondsLeft, setSecondsLeft] = useState(0);

  const start = useCallback(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  return {
    secondsLeft,
    isActive: secondsLeft > 0,
    canResend: secondsLeft === 0,
    start,
  };
};

export default useOtpTimer;
