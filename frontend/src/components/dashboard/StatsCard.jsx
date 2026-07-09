/**
 * components/dashboard/StatsCard.jsx — Premium Statistics Widget
 *
 * Features:
 * - Top gradient accent stripe
 * - Gradient icon container with glow
 * - Trend badge (up/down/neutral)
 * - Hover lift with shadow enhancement
 */

import { forwardRef } from 'react';

const StatsCard = forwardRef(
  (
    {
      title,
      value,
      icon: Icon,
      badgeText,
      trend,         // 'up' | 'down' | 'neutral'
      trendValue,    // e.g. '+12%'
      description,
      iconVariant = 'blue',  // 'blue' | 'emerald' | 'violet' | 'amber' | 'red' | 'sky'
      className = '',
      ...props
    },
    ref
  ) => {
    const iconVariants = {
      blue:    'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
      emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      violet:  'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400',
      amber:   'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
      red:     'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
      sky:     'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400',
    };

    const trendColors = {
      up:      'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10',
      down:    'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10',
      neutral: 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800',
    };

    const trendArrows = { up: '↑', down: '↓', neutral: '→' };

    return (
      <div
        ref={ref}
        className={`
          relative group overflow-hidden
          bg-white dark:bg-slate-800/90
          rounded-2xl border border-slate-200/80 dark:border-slate-700/60
          shadow-[0_4px_6px_-1px_rgba(0,0,0,0.07)]
          hover:shadow-[0_10px_20px_-4px_rgba(0,0,0,0.1)]
          dark:hover:shadow-[0_10px_20px_-4px_rgba(0,0,0,0.35)]
          hover:-translate-y-0.5
          transition-all duration-300
          p-5 flex items-center justify-between text-left
          ${className}
        `}
        {...props}
      >
        {/* Top accent stripe */}
        <div
          className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl ${
            iconVariants[iconVariant]?.includes('blue') ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
            iconVariants[iconVariant]?.includes('emerald') ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
            iconVariants[iconVariant]?.includes('violet') ? 'bg-gradient-to-r from-violet-500 to-purple-500' :
            iconVariants[iconVariant]?.includes('amber') ? 'bg-gradient-to-r from-amber-400 to-orange-400' :
            iconVariants[iconVariant]?.includes('red') ? 'bg-gradient-to-r from-red-500 to-rose-500' :
            'bg-gradient-to-r from-sky-500 to-cyan-400'
          }`}
          aria-hidden="true"
        />

        {/* Content */}
        <div className="space-y-2 min-w-0 flex-1 pr-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 truncate">
            {title}
          </p>

          <div className="flex items-baseline gap-2.5 flex-wrap">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums leading-none">
              {value}
            </span>
            {(badgeText || (trend && trendValue)) && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  trend ? trendColors[trend] : 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400'
                }`}
              >
                {trend && <span aria-hidden="true">{trendArrows[trend]} </span>}
                {trendValue || badgeText}
              </span>
            )}
          </div>

          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {description}
            </p>
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${
              iconVariants[iconVariant] || iconVariants.blue
            }`}
          >
            <Icon className="h-5.5 w-5.5" aria-hidden="true" />
          </div>
        )}
      </div>
    );
  }
);

StatsCard.displayName = 'StatsCard';

export default StatsCard;
