/**
 * components/common/OtpInput.jsx — 6-digit OTP input with paste support
 */

import { useRef, useEffect } from 'react';

const OtpInput = ({
  value = '',
  onChange,
  length = 6,
  disabled = false,
  error,
  id = 'otp-input',
}) => {
  const inputsRef = useRef([]);

  const digits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const updateValue = (newDigits) => {
    onChange(newDigits.join('').slice(0, length));
  };

  const handleChange = (index, char) => {
    if (!/^\d?$/.test(char)) return;
    const next = [...digits];
    next[index] = char;
    updateValue(next);
    if (char && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    updateValue(pasted.split(''));
    const focusIndex = Math.min(pasted.length, length - 1);
    inputsRef.current[focusIndex]?.focus();
  };

  return (
    <div>
      <div
        className="flex justify-center gap-2 sm:gap-3"
        role="group"
        aria-label="One-time password digits"
      >
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputsRef.current[index] = el; }}
            id={index === 0 ? id : undefined}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border transition-all
              ${error
                ? 'border-red-400 focus:ring-red-500/30'
                : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500/30'
              }
              bg-white dark:bg-slate-800 text-slate-900 dark:text-white
              focus:outline-none focus:ring-2`}
            aria-label={`Digit ${index + 1} of ${length}`}
          />
        ))}
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-500 text-center" role="alert">{error}</p>
      )}
    </div>
  );
};

export default OtpInput;
