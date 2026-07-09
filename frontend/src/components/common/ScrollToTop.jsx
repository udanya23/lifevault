/**
 * ScrollToTop — Floating button to return to page top
 */

import { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
      aria-label="Scroll back to top"
    >
      <FaArrowUp className="h-4 w-4" />
    </button>
  );
};

export default ScrollToTop;
