/**
 * SkipLink — Accessibility skip navigation
 * Allows keyboard users to bypass repetitive nav and jump to main content.
 */

const SkipLink = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:font-semibold focus:text-sm focus:shadow-lg"
  >
    Skip to main content
  </a>
);

export default SkipLink;
