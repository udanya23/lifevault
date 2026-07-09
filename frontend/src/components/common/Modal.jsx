/**
 * components/common/Modal.jsx — Premium Animated Modal
 *
 * Features:
 * - Deep glassmorphism backdrop with saturation blur
 * - Spring-animated scale + slide entry
 * - Escape key & backdrop close
 * - Scroll-lock on body
 * - Header, footer slot, and size variants
 */

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

const Modal = ({
  isOpen = false,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',       // 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnBackdrop = true,
  showCloseButton = true,
  icon: Icon,
}) => {
  const firstFocusRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && isOpen) onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Auto-focus when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstFocusRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const sizes = {
    sm:   'max-w-sm',
    md:   'max-w-lg',
    lg:   'max-w-2xl',
    xl:   'max-w-4xl',
    full: 'max-w-[95vw]',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          aria-modal="true"
          role="dialog"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          {/* ── Backdrop ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOnBackdrop ? onClose : undefined}
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* ── Dialog Panel ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
            className={`
              relative w-full z-50 flex flex-col
              max-h-[90vh] overflow-hidden
              ${sizes[size] || sizes.md}
              bg-white dark:bg-slate-900
              border border-slate-200/80 dark:border-slate-700/60
              rounded-2xl shadow-[0_25px_60px_-10px_rgba(0,0,0,0.25)]
              dark:shadow-[0_25px_60px_-10px_rgba(0,0,0,0.6)]
            `}
          >
            {/* Top gradient accent line */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-t-2xl" />

            {/* ── Header ── */}
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  {Icon && (
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                    </div>
                  )}
                  <div className="min-w-0">
                    {title && (
                      <h3
                        id="modal-title"
                        className="text-base font-bold text-slate-900 dark:text-white leading-tight"
                      >
                        {title}
                      </h3>
                    )}
                    {subtitle && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {showCloseButton && (
                  <button
                    ref={firstFocusRef}
                    onClick={onClose}
                    aria-label="Close modal"
                    className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150 cursor-pointer"
                  >
                    <FaTimes className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            )}

            {/* ── Content ── */}
            <div className="flex-1 overflow-y-auto px-6 pb-2 text-sm text-slate-700 dark:text-slate-200">
              {children}
            </div>

            {/* ── Footer ── */}
            {footer && (
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
