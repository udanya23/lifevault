/**
 * components/common/Input.jsx — Premium Form Input Field
 *
 * Designed to work with `react-hook-form` via forwardRef.
 * Features:
 * - Comfortable label-to-input spacing
 * - Animated focus ring with glow
 * - Error shake animation
 * - Password visibility toggle with smooth icon swap
 * - Leading / trailing icons
 */

import { forwardRef, useState, useId } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Input = forwardRef(
  (
    {
      label,
      name,
      type = 'text',
      error,
      icon: Icon,
      trailingIcon: TrailingIcon,
      helperText,
      className = '',
      required,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const uid = useId();
    const inputId = name || uid;

    const isPasswordType = type === 'password';
    const inputType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className={`flex flex-col w-full text-left gap-2 ${className}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-300 select-none"
          >
            {label}
            {required && (
              <span className="ml-1 text-red-500" aria-hidden="true">*</span>
            )}
          </label>
        )}

        {/* Input Wrapper */}
        <div className="relative group">
          {/* Leading Icon */}
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <Icon
                className={`h-4 w-4 shrink-0 transition-colors duration-150 ${
                  error
                    ? 'text-red-400'
                    : 'text-slate-400 group-focus-within:text-blue-500 dark:text-slate-500 dark:group-focus-within:text-blue-400'
                }`}
                aria-hidden="true"
              />
            </div>
          )}

          {/* Input Element */}
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={inputType}
            required={required}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            className={`
              block w-full rounded-xl border text-sm font-medium
              bg-white dark:bg-slate-900/80
              text-slate-900 dark:text-slate-100
              placeholder-slate-400 dark:placeholder-slate-600
              transition-all duration-200 outline-none
              ${Icon ? 'pl-11' : 'pl-4'}
              ${isPasswordType || TrailingIcon ? 'pr-12' : 'pr-4'}
              py-3
              ${
                error
                  ? 'border-red-400 dark:border-red-500 ' +
                    'ring-2 ring-red-400/20 dark:ring-red-500/20 ' +
                    'focus:border-red-500 focus:ring-red-400/30 ' +
                    'bg-red-50/40 dark:bg-red-950/10'
                  : 'border-slate-200 dark:border-slate-700 ' +
                    'focus:border-blue-500 dark:focus:border-blue-400 ' +
                    'focus:ring-2 focus:ring-blue-500/15 dark:focus:ring-blue-400/20 ' +
                    'hover:border-slate-300 dark:hover:border-slate-600'
              }
            `}
            {...props}
          />

          {/* Trailing Icon (non-password) */}
          {TrailingIcon && !isPasswordType && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <TrailingIcon className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
            </div>
          )}

          {/* Password Toggle Button */}
          {isPasswordType && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors cursor-pointer"
            >
              {showPassword ? (
                <FaEyeSlash className="h-4 w-4 shrink-0" aria-hidden="true" />
              ) : (
                <FaEye className="h-4 w-4 shrink-0" aria-hidden="true" />
              )}
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <span
            id={`${inputId}-error`}
            role="alert"
            className="flex items-center gap-1.5 text-xs font-medium text-red-500 dark:text-red-400 animate-[fadeIn_0.2s_ease-out]"
          >
            <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </span>
        )}

        {/* Helper Text */}
        {!error && helperText && (
          <span
            id={`${inputId}-helper`}
            className="text-xs text-slate-400 dark:text-slate-500"
          >
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
