import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSun, FaMoon } from 'react-icons/fa';
import { selectIsDarkMode, toggleDarkMode } from '@/features/ui/uiSlice';

const ThemeToggle = ({ className = '' }) => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector(selectIsDarkMode);

  return (
    <button
      type="button"
      onClick={() => dispatch(toggleDarkMode())}
      className={`p-2.5 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150 cursor-pointer ${className}`}
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
  );
};

export default ThemeToggle;
