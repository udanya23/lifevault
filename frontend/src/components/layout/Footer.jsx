/**
 * components/layout/Footer.jsx — Premium Public Footer
 *
 * Gradient top border, refined typography, animated trust badges.
 */

import { Link } from 'react-router-dom';
import { FaShieldAlt, FaLock, FaUserShield, FaHeart } from 'react-icons/fa';
import { ROUTES } from '@/utils/constants';

const Footer = () => {
  const year = new Date().getFullYear();

  const platformLinks = [
    { label: 'Key Features',        href: '#features' },
    { label: 'How It Works',        href: '#how-it-works' },
    { label: 'Interactive Demo',    href: '#demo' },
    { label: 'Security Overview',   href: '#security' },
  ];

  const accountLinks = [
    { label: 'Create Free Account', to: ROUTES.REGISTER },
    { label: 'Sign In',             to: ROUTES.LOGIN },
    { label: 'Dashboard',           to: ROUTES.DASHBOARD },
  ];

  const legalLinks = [
    { label: 'Privacy & Security',         href: '/#security' },
    { label: 'Contact Support',            href: 'mailto:support@lifevault.app' },
    { label: 'Frequently Asked Questions', href: '/#faq' },
  ];

  return (
    <footer className="relative bg-white dark:bg-slate-950 border-t border-slate-200/40 dark:border-slate-800/40 transition-colors duration-200 overflow-hidden -mt-px">
      {/* Gradient top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      {/* Subtle background mesh */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] rounded-full bg-blue-400/5 dark:bg-blue-600/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[200px] rounded-full bg-indigo-400/5 dark:bg-indigo-600/5 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* ── Col 1: Brand ── */}
          <div className="flex flex-col gap-4 text-left lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 group w-fit">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_2px_8px_rgba(37,99,235,0.3)] transition-transform duration-200 group-hover:scale-105">
                <FaShieldAlt className="h-4 w-4 text-white" aria-hidden="true" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                Life<span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Vault</span>
              </span>
            </Link>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              A secure emergency information platform. Store critical medical profiles, documents, and next-of-kin contacts. First responders get instant access when it matters most.
            </p>

            {/* Trust badges */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/25 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30 w-fit">
                <FaLock className="h-3 w-3 shrink-0" aria-hidden="true" />
                AES-256 Encrypted
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/25 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900/30 w-fit">
                <FaShieldAlt className="h-3 w-3 shrink-0" aria-hidden="true" />
                Zero-Knowledge Policy
              </div>
            </div>
          </div>

          {/* ── Col 2: Platform ── */}
          <div className="text-left">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white mb-5">
              Platform
            </h3>
            <ul className="space-y-3">
              {platformLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors duration-150"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 3: Account ── */}
          <div className="text-left">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white mb-5">
              Account
            </h3>
            <ul className="space-y-3">
              {accountLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors duration-150"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 4: Legal ── */}
          <div className="text-left">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white mb-5">
              Legal & Help
            </h3>
            <ul className="space-y-3">
              {legalLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors duration-150"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="border-t border-slate-200/60 dark:border-slate-800/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-slate-400 dark:text-slate-500">
            <FaUserShield className="h-3.5 w-3.5 text-blue-500 shrink-0" aria-hidden="true" />
            <span>HIPAA and GDPR compliant design standards.</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
            <span>© {year} LifeVault. Made with</span>
            <FaHeart className="h-3 w-3 text-red-400 mx-0.5" aria-hidden="true" />
            <span>for emergency preparedness.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
