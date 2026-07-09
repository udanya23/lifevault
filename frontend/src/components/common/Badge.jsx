/**
 * components/common/Badge.jsx — Premium Status Badge
 *
 * Variants: default, primary, success, danger, warning, info, purple, dark
 * Supports dot indicator, removable (×), and icon slot.
 */

import { forwardRef } from 'react';

const Badge = forwardRef(
  (
    {
      children,
      variant = 'default',
      size = 'md',
      dot = false,
      icon: Icon,
      className = '',
      ...props
    },
    ref
  ) => {
    const base =
      'inline-flex items-center gap-1.5 font-semibold tracking-wide rounded-full border transition-colors duration-150';

    const sizes = {
      sm: 'px-2 py-0.5 text-[10px]',
      md: 'px-2.5 py-0.5 text-xs',
      lg: 'px-3 py-1 text-sm',
    };

    const variants = {
      default:
        'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80',
      primary:
        'bg-blue-50 dark:bg-blue-500/12 text-blue-700 dark:text-blue-400 border-blue-200/70 dark:border-blue-500/25',
      success:
        'bg-emerald-50 dark:bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-500/25',
      danger:
        'bg-red-50 dark:bg-red-500/12 text-red-700 dark:text-red-400 border-red-200/70 dark:border-red-500/25',
      warning:
        'bg-amber-50 dark:bg-amber-500/12 text-amber-700 dark:text-amber-400 border-amber-200/70 dark:border-amber-500/25',
      info:
        'bg-sky-50 dark:bg-sky-500/12 text-sky-700 dark:text-sky-400 border-sky-200/70 dark:border-sky-500/25',
      purple:
        'bg-violet-50 dark:bg-violet-500/12 text-violet-700 dark:text-violet-400 border-violet-200/70 dark:border-violet-500/25',
      dark:
        'bg-slate-800 dark:bg-slate-700 text-slate-100 border-slate-700 dark:border-slate-600',
      gradient:
        'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-[0_2px_8px_rgba(37,99,235,0.3)]',
    };

    const dotColors = {
      default: 'bg-slate-400',
      primary: 'bg-blue-500',
      success: 'bg-emerald-500',
      danger:  'bg-red-500',
      warning: 'bg-amber-500',
      info:    'bg-sky-500',
      purple:  'bg-violet-500',
      dark:    'bg-slate-400',
      gradient:'bg-white',
    };

    return (
      <span
        ref={ref}
        className={`${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.default} ${className}`}
        {...props}
      >
        {/* Status dot */}
        {dot && (
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant] || dotColors.default}`}
            aria-hidden="true"
          />
        )}

        {/* Icon */}
        {Icon && <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />}

        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
