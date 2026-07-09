/**
 * components/layout/Navbar.jsx — Public Navigation Bar
 *
 * Premium features:
 * - Glassmorphism surface with smooth scroll-activated backdrop blur
 * - Animated underline on active nav links
 * - Gradient brand logo
 * - Smooth mobile drawer with Framer Motion
 * - Theme toggle with icon swap animation
 */

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSun, FaMoon, FaBars, FaTimes, FaShieldAlt } from 'react-icons/fa';

import { selectIsAuthenticated } from '@/features/auth/authSlice';
import { selectIsDarkMode, toggleDarkMode } from '@/features/ui/uiSlice';
import { ROUTES } from '@/utils/constants';
import Button from '@/components/common/Button';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isDarkMode = useSelector(selectIsDarkMode);

  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setIsOpen(false); }, [location]);

  const scrollTo = (id) => {
    setIsOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { label: 'Features',      id: 'features' },
    { label: 'How It Works',  id: 'how-it-works' },
    { label: 'Security',      id: 'security' },
    { label: 'Demo',          id: 'demo' },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300 ease-in-out
        ${isScrolled
          ? 'bg-white/80 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm py-3'
          : 'bg-transparent py-5'}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* ── Brand Logo ── */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
            aria-label="LifeVault home"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_2px_8px_rgba(37,99,235,0.35)] transition-transform duration-200 group-hover:scale-105">
              <FaShieldAlt className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
              Life<span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Vault</span>
            </span>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="relative px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-white transition-colors duration-150 rounded-lg hover:bg-blue-50/60 dark:hover:bg-slate-800/50 cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* ── Desktop Right Controls ── */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => dispatch(toggleDarkMode())}
              className="p-2.5 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150 cursor-pointer"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isDarkMode ? 'sun' : 'moon'}
                  initial={{ opacity: 0, rotate: -30 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 30 }}
                  transition={{ duration: 0.15 }}
                  className="block"
                >
                  {isDarkMode
                    ? <FaSun className="h-4 w-4" aria-hidden="true" />
                    : <FaMoon className="h-4 w-4" aria-hidden="true" />}
                </motion.span>
              </AnimatePresence>
            </button>

            {/* Auth CTAs */}
            {isAuthenticated ? (
              <Link to={ROUTES.DASHBOARD}>
                <Button variant="primary" size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to={ROUTES.LOGIN}>
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to={ROUTES.REGISTER}>
                  <Button variant="primary" size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile Controls ── */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => dispatch(toggleDarkMode())}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <FaSun className="h-4 w-4" aria-hidden="true" /> : <FaMoon className="h-4 w-4" aria-hidden="true" />}
            </button>

            <button
              onClick={() => setIsOpen((v) => !v)}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-nav"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isOpen ? 'close' : 'open'}
                  initial={{ opacity: 0, rotate: -20 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 20 }}
                  transition={{ duration: 0.15 }}
                  className="block"
                >
                  {isOpen ? <FaTimes className="h-5 w-5" aria-hidden="true" /> : <FaBars className="h-5 w-5" aria-hidden="true" />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden border-t border-slate-200/60 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl"
          >
            <div className="px-4 pt-3 pb-6 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="block w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  {link.label}
                </button>
              ))}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                {isAuthenticated ? (
                  <Link to={ROUTES.DASHBOARD} className="block">
                    <Button variant="primary" fullWidth>Go to Dashboard</Button>
                  </Link>
                ) : (
                  <>
                    <Link to={ROUTES.LOGIN} className="block">
                      <Button variant="outline" fullWidth>Sign In</Button>
                    </Link>
                    <Link to={ROUTES.REGISTER} className="block">
                      <Button variant="primary" fullWidth>Create Free Account</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
