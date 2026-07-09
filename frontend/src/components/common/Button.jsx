/**
 * components/common/Button.jsx — Premium Animated Button
 *
 * Tailwind v4 + Framer Motion micro-animations.
 * Variants: primary (gradient), secondary, danger, success, outline, ghost
 * Sizes: xs, sm, md, lg, xl
 * States: loading spinner, disabled, icon left/right
 */

import { forwardRef } from 'react';
import { motion } from 'framer-motion';

const Button = forwardRef(
  (
    {
      children,
      type = 'button',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      isDisabled = false,
      icon: Icon,
      iconPosition = 'left',
      fullWidth = false,
      onClick,
      className = '',
      ...props
    },
    ref
  ) => {
    // ── Base ──────────────────────────────────────────────────────────────────
    const base =
      'relative inline-flex items-center justify-center font-semibold rounded-xl ' +
      'transition-all duration-200 focus:outline-none focus-visible:ring-2 ' +
      'focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ' +
      'select-none overflow-hidden';

    // ── Variants ──────────────────────────────────────────────────────────────
    const variants = {
      primary:
        'bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 ' +
        'active:from-blue-700 active:to-indigo-700 ' +
        'text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)] ' +
        'hover:shadow-[0_6px_20px_rgba(37,99,235,0.45)] ' +
        'focus-visible:ring-blue-500 border border-transparent',

      secondary:
        'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 ' +
        'dark:bg-slate-700/80 dark:text-slate-200 dark:hover:bg-slate-600 ' +
        'focus-visible:ring-slate-400 border border-transparent shadow-sm',

      outline:
        'bg-transparent border border-slate-300 dark:border-slate-600 ' +
        'text-slate-700 dark:text-slate-200 ' +
        'hover:bg-slate-50 dark:hover:bg-slate-800/60 ' +
        'hover:border-slate-400 dark:hover:border-slate-500 ' +
        'focus-visible:ring-blue-500 shadow-sm',

      danger:
        'bg-gradient-to-br from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 ' +
        'active:from-red-700 active:to-rose-700 ' +
        'text-white shadow-[0_4px_14px_rgba(239,68,68,0.3)] ' +
        'hover:shadow-[0_6px_20px_rgba(239,68,68,0.4)] ' +
        'focus-visible:ring-red-500 border border-transparent',

      success:
        'bg-gradient-to-br from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 ' +
        'text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)] ' +
        'hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] ' +
        'focus-visible:ring-emerald-500 border border-transparent',

      ghost:
        'bg-transparent text-slate-600 dark:text-slate-300 ' +
        'hover:bg-slate-100 dark:hover:bg-slate-800/70 ' +
        'active:bg-slate-200 dark:active:bg-slate-700 ' +
        'focus-visible:ring-slate-400 border border-transparent',

      'outline-primary':
        'bg-transparent border-2 border-blue-600 dark:border-blue-500 ' +
        'text-blue-600 dark:text-blue-400 ' +
        'hover:bg-blue-50 dark:hover:bg-blue-950/30 ' +
        'focus-visible:ring-blue-500',
    };

    // ── Sizes ─────────────────────────────────────────────────────────────────
    const sizes = {
      xs: 'px-2.5 py-1 text-xs gap-1',
      sm: 'px-3.5 py-1.5 text-sm gap-1.5',
      md: 'px-5 py-2.5 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2',
      xl: 'px-8 py-4 text-lg gap-2.5',
    };

    const iconSizes = {
      xs: 'h-3 w-3',
      sm: 'h-3.5 w-3.5',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
      xl: 'h-5 w-5',
    };

    const width = fullWidth ? 'w-full' : '';
    const hoverScale = isDisabled || isLoading ? 1 : 1.015;
    const tapScale = isDisabled || isLoading ? 1 : 0.97;

    return (
      <motion.button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={isDisabled || isLoading}
        whileHover={{ scale: hoverScale }}
        whileTap={{ scale: tapScale }}
        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${width} ${className}`}
        {...props}
      >
        {/* Shimmer overlay for primary/danger/success on hover */}
        {(variant === 'primary' || variant === 'danger' || variant === 'success') && (
          <span
            className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent
              -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"
            aria-hidden="true"
          />
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <svg
            className={`animate-spin shrink-0 ${iconSizes[size] || iconSizes.md}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {/* Left Icon */}
        {!isLoading && Icon && iconPosition === 'left' && (
          <Icon className={`${iconSizes[size] || iconSizes.md} shrink-0`} aria-hidden="true" />
        )}

        {/* Label */}
        <span className={isLoading ? 'opacity-70' : ''}>
          {isLoading ? 'Processing…' : children}
        </span>

        {/* Right Icon */}
        {!isLoading && Icon && iconPosition === 'right' && (
          <Icon className={`${iconSizes[size] || iconSizes.md} shrink-0`} aria-hidden="true" />
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
