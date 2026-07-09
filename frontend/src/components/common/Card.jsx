/**
 * components/common/Card.jsx — Premium Container Card
 *
 * Variants: default, elevated, glass, flat, gradient
 * Supports hover lift, top accent border, and inner glow on focus.
 */

import { forwardRef } from 'react';

const Card = forwardRef(
  (
    {
      children,
      className = '',
      isHoverable = false,
      isGlass = false,
      variant = 'default',   // 'default' | 'elevated' | 'glass' | 'flat' | 'gradient'
      accent = false,        // shows a top gradient accent stripe
      padding = 'md',
      onClick,
      ...props
    },
    ref
  ) => {
    const paddings = {
      none: '',
      xs:   'p-3',
      sm:   'p-4',
      md:   'p-6',
      lg:   'p-8',
      xl:   'p-10',
    };

    const variantClasses = {
      default:
        'bg-white dark:bg-slate-800/90 rounded-2xl ' +
        'border border-slate-200/80 dark:border-slate-700/60 ' +
        'shadow-[0_4px_6px_-1px_rgba(0,0,0,0.07),0_2px_4px_-2px_rgba(0,0,0,0.05)]',

      elevated:
        'bg-white dark:bg-slate-800 rounded-2xl ' +
        'border border-slate-100 dark:border-slate-700/50 ' +
        'shadow-[0_10px_15px_-3px_rgba(0,0,0,0.08),0_4px_6px_-4px_rgba(0,0,0,0.04)]',

      glass:
        'rounded-2xl backdrop-blur-xl ' +
        'bg-white/10 dark:bg-slate-900/50 ' +
        'border border-white/20 dark:border-white/8 ' +
        'shadow-[0_8px_32px_rgba(0,0,0,0.12)]',

      flat:
        'bg-slate-50 dark:bg-slate-900/60 rounded-2xl ' +
        'border border-slate-200/60 dark:border-slate-800',

      gradient:
        'rounded-2xl border border-white/20 ' +
        'bg-gradient-to-br from-white to-slate-50/80 dark:from-slate-800 dark:to-slate-900 ' +
        'shadow-[0_4px_6px_-1px_rgba(0,0,0,0.07)]',
    };

    const hoverClasses = isHoverable
      ? 'cursor-pointer transition-all duration-300 ' +
        'hover:-translate-y-1 hover:shadow-[0_12px_24px_-4px_rgba(0,0,0,0.12)] ' +
        'dark:hover:shadow-[0_12px_24px_-4px_rgba(0,0,0,0.4)] ' +
        'hover:border-slate-300/80 dark:hover:border-slate-600/60'
      : onClick
      ? 'cursor-pointer transition-all duration-200'
      : 'transition-all duration-200';

    const clickClasses = onClick && !isHoverable
      ? 'hover:bg-slate-50 dark:hover:bg-slate-700/50 active:scale-[0.99]'
      : '';

    const accentClass = accent
      ? 'relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 ' +
        'before:h-[3px] before:bg-gradient-to-r before:from-blue-500 before:to-indigo-500 ' +
        'before:rounded-t-2xl'
      : '';

    const selected = isGlass ? variantClasses.glass : (variantClasses[variant] || variantClasses.default);

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={`
          ${selected}
          ${hoverClasses}
          ${clickClasses}
          ${accentClass}
          ${paddings[padding]}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
