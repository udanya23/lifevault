/**
 * components/common/Select.jsx — Premium Dropdown Selector
 *
 * Matches Input.jsx styling with focus glow, icon support,
 * consistent error states, and custom chevron.
 */

import { forwardRef, useId } from 'react';

const Select = forwardRef(
  (
    {
      label,
      name,
      options = [],   // [{ value, label }] or string[]
      error,
      icon: Icon,
      helperText,
      placeholder = 'Select an option…',
      required,
      className = '',
      ...props
    },
    ref
  ) => {
    const uid = useId();
    const inputId = name || uid;

    return (
      <div className={`flex flex-col w-full text-left gap-1.5 ${className}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-400 select-none"
          >
            {label}
            {required && (
              <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>
            )}
          </label>
        )}

        {/* Wrapper */}
        <div className="relative group">
          {/* Leading Icon */}
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
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

          {/* Select Element */}
          <select
            ref={ref}
            id={inputId}
            name={name}
            required={required}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            className={`
              block w-full rounded-xl border text-sm font-medium cursor-pointer
              bg-white dark:bg-slate-900/80
              text-slate-900 dark:text-slate-100
              transition-all duration-200 outline-none appearance-none
              ${Icon ? 'pl-10' : 'pl-4'}
              pr-10 py-2.5
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
          >
            <option value="" disabled className="text-slate-400">
              {placeholder}
            </option>
            {options.map((opt, i) => {
              const val = typeof opt === 'object' ? opt.value : opt;
              const lbl = typeof opt === 'object' ? opt.label : opt;
              return (
                <option key={i} value={val}>
                  {lbl}
                </option>
              );
            })}
          </select>

          {/* Custom chevron */}
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
            <svg
              className={`h-4 w-4 shrink-0 transition-colors duration-150 ${
                error
                  ? 'text-red-400'
                  : 'text-slate-400 group-focus-within:text-blue-500 dark:text-slate-500 dark:group-focus-within:text-blue-400'
              }`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Error */}
        {error && (
          <span
            id={`${inputId}-error`}
            role="alert"
            className="flex items-center gap-1.5 text-xs font-medium text-red-500 dark:text-red-400 mt-0.5"
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

        {/* Helper */}
        {!error && helperText && (
          <span id={`${inputId}-helper`} className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
