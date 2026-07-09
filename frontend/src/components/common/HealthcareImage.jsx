/**
 * HealthcareImage — responsive healthcare visuals with graceful fallback
 *
 * - object-fit: cover, rounded corners, soft shadow
 * - lazy loading, hover scale (1.03)
 * - gradient placeholder when image is missing or fails to load
 */

import { useState } from 'react';
import { FaHeartbeat } from 'react-icons/fa';

const HealthcareImage = ({
  src,
  alt = '',
  className = '',
  imgClassName = '',
  rounded = 'rounded-3xl',
  hover = true,
  lazy = true,
  placeholderLabel = 'Healthcare image',
  children,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const showPlaceholder = !src || hasError;

  return (
    <div
      className={[
        'relative overflow-hidden',
        rounded,
        hover ? 'group' : '',
        !className.includes('shadow') && 'shadow-lg shadow-slate-200/50 dark:shadow-slate-900/40',
        className,
      ].join(' ')}
    >
      {showPlaceholder ? (
        <div
          className="absolute inset-0 bg-gradient-to-br from-blue-100 via-slate-50 to-indigo-100 dark:from-slate-800 dark:via-slate-800 dark:to-blue-950 flex flex-col items-center justify-center gap-3"
          role="img"
          aria-label={alt || placeholderLabel}
        >
          <div className="w-14 h-14 rounded-2xl bg-white/70 dark:bg-slate-700/50 flex items-center justify-center shadow-sm">
            <FaHeartbeat className="h-6 w-6 text-blue-500 dark:text-blue-400" aria-hidden="true" />
          </div>
          <p className="text-xs font-semibold text-blue-600/60 dark:text-blue-400/60 px-6 text-center max-w-[200px] leading-relaxed">
            {placeholderLabel}
          </p>
        </div>
      ) : (
        <>
          {!isLoaded && <div className="absolute inset-0 skeleton" aria-hidden="true" />}
          <img
            src={src}
            alt={alt}
            loading={lazy ? 'lazy' : 'eager'}
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            className={[
              'w-full h-full object-cover transition-transform duration-500 ease-out',
              hover ? 'group-hover:scale-[1.03]' : '',
              !isLoaded ? 'opacity-0' : 'opacity-100',
              'transition-opacity duration-300',
              imgClassName,
            ].join(' ')}
          />
        </>
      )}
      {children}
    </div>
  );
};

export default HealthcareImage;
