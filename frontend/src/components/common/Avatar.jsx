/**
 * components/common/Avatar.jsx — Premium Avatar Component
 *
 * Renders user profile photos or falls back to initials.
 * Features:
 * - Consistent hashed HSL color per name
 * - Ring / border support
 * - Online status indicator
 * - Subtle image hover zoom
 */

import { forwardRef } from 'react';

const getHashColor = (name = '') => {
  if (!name) return { h: 220, s: 70, l: 48 };
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash % 360);
  // Avoid muddy browns by offsetting certain ranges
  const adjusted = h > 25 && h < 45 ? h + 20 : h;
  return { h: adjusted, s: 60, l: 44 };
};

const getInitials = (name = '') => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
};

const Avatar = forwardRef(
  (
    {
      src,
      name = '',
      size = 'md',
      status,          // 'online' | 'offline' | 'away' | null
      ring = false,    // adds a ring border
      className = '',
      onClick,
      ...props
    },
    ref
  ) => {
    const sizes = {
      xs:  { outer: 'w-6 h-6',   text: 'text-[9px] font-bold' },
      sm:  { outer: 'w-8 h-8',   text: 'text-xs font-bold' },
      md:  { outer: 'w-10 h-10', text: 'text-sm font-bold' },
      lg:  { outer: 'w-14 h-14', text: 'text-base font-bold' },
      xl:  { outer: 'w-20 h-20', text: 'text-xl font-bold' },
      '2xl': { outer: 'w-28 h-28', text: 'text-3xl font-bold' },
    };

    const statusDotSizes = {
      xs: 'w-1.5 h-1.5 border',
      sm: 'w-2 h-2 border',
      md: 'w-2.5 h-2.5 border-2',
      lg: 'w-3 h-3 border-2',
      xl: 'w-3.5 h-3.5 border-2',
      '2xl': 'w-4 h-4 border-2',
    };

    const statusColors = {
      online:  'bg-emerald-500',
      offline: 'bg-slate-400',
      away:    'bg-amber-400',
    };

    const { h, s, l } = getHashColor(name);
    const bgStyle = { backgroundColor: `hsl(${h}, ${s}%, ${l}%)` };
    const hasImage = src && src !== '';
    const initials = getInitials(name);
    const sz = sizes[size] || sizes.md;

    const ringClass = ring
      ? 'ring-2 ring-white dark:ring-slate-900 ring-offset-0'
      : '';

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={`
          relative shrink-0 rounded-full flex items-center justify-center
          overflow-hidden select-none
          ${sz.outer}
          ${ringClass}
          ${onClick ? 'cursor-pointer transition-transform duration-150 hover:scale-105 active:scale-95' : ''}
          ${className}
        `}
        style={!hasImage ? { ...bgStyle, color: '#fff' } : {}}
        title={name || undefined}
        aria-label={name || 'User avatar'}
        {...props}
      >
        {hasImage ? (
          <img
            src={src}
            alt={name || 'User avatar'}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <span className={sz.text} aria-hidden="true">
            {initials}
          </span>
        )}

        {/* Status indicator dot */}
        {status && (
          <span
            className={`
              absolute bottom-0 right-0
              rounded-full border-white dark:border-slate-900
              ${statusDotSizes[size] || statusDotSizes.md}
              ${statusColors[status] || statusColors.offline}
            `}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export default Avatar;
