/**
 * components/dashboard/VaultHealthScore.jsx — Emergency Readiness Score
 *
 * Calculates a 0–100 "Vault Health Score" from profile completeness:
 * blood group, allergies, medicines, emergency contacts, documents,
 * chronic diseases, height/weight, medical notes.
 *
 * Renders an animated SVG ring with gradient fill, score label,
 * colour-coded status, and an actionable checklist of what's missing.
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaCheck, FaTimes, FaArrowRight,
  FaShieldAlt,
} from 'react-icons/fa';
import { ROUTES } from '@/utils/constants';

// ── Score calculation ─────────────────────────────────────────────────────────
const CRITERIA = [
  { key: 'bloodGroup',       label: 'Blood group set',            weight: 20, route: ROUTES.PROFILE },
  { key: 'allergies',        label: 'Allergies listed',           weight: 15, route: ROUTES.PROFILE },
  { key: 'currentMedicines', label: 'Medications recorded',       weight: 15, route: ROUTES.PROFILE },
  { key: 'emergencyContacts',label: 'Emergency contact added',    weight: 20, route: ROUTES.PROFILE },
  { key: 'documents',        label: 'Document uploaded',          weight: 15, route: ROUTES.DOCUMENTS },
  { key: 'vitals',           label: 'Height & weight filled',     weight: 10, route: ROUTES.PROFILE },
  { key: 'chronicDiseases',  label: 'Chronic conditions listed',  weight:  5, route: ROUTES.PROFILE },
];

const calcScore = (stats) => {
  let score = 0;
  const results = CRITERIA.map((c) => {
    let met = false;
    switch (c.key) {
      case 'bloodGroup':        met = !!stats.bloodGroup && stats.bloodGroup !== 'unknown'; break;
      case 'allergies':         met = (stats.allergiesCount || 0) > 0; break;
      case 'currentMedicines':  met = (stats.medicinesCount || 0) > 0; break;
      case 'emergencyContacts': met = (stats.contactsCount || 0) > 0; break;
      case 'documents':         met = (stats.documentsCount || 0) > 0; break;
      case 'vitals':            met = !!(stats.height && stats.weight); break;
      case 'chronicDiseases':   met = (stats.chronicCount || 0) > 0; break;
      default: met = false;
    }
    if (met) score += c.weight;
    return { ...c, met };
  });
  return { score: Math.min(score, 100), results };
};

// ── Score ring SVG ────────────────────────────────────────────────────────────
const ScoreRing = ({ score, color }) => {
  const R = 52;
  const circumference = 2 * Math.PI * R;
  const dash = (score / 100) * circumference;

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" aria-hidden="true">
      <defs>
        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={`${color}99`} />
        </linearGradient>
      </defs>
      {/* Track */}
      <circle cx="70" cy="70" r={R} fill="none" stroke="currentColor" className="text-slate-100 dark:text-slate-700/50" strokeWidth="12" />
      {/* Progress */}
      <motion.circle
        cx="70" cy="70" r={R}
        fill="none"
        stroke="url(#scoreGrad)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference - dash }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        style={{ transformOrigin: '70px 70px', transform: 'rotate(-90deg)' }}
      />
    </svg>
  );
};

// ── Status config ─────────────────────────────────────────────────────────────
const getStatus = (score) => {
  if (score >= 90) {
    return {
      label: 'Excellent',
      color: '#10b981', // emerald-500
      badgeClasses: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20',
      ctaClasses: 'bg-emerald-50/70 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 text-emerald-800 dark:text-emerald-300',
      accentColor: 'from-emerald-500 to-teal-500',
    };
  }
  if (score >= 70) {
    return {
      label: 'Good',
      color: '#3b82f6', // blue-500
      badgeClasses: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20',
      ctaClasses: 'bg-blue-50/70 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 text-blue-800 dark:text-blue-300',
      accentColor: 'from-blue-500 to-indigo-500',
    };
  }
  if (score >= 50) {
    return {
      label: 'Needs Work',
      color: '#f59e0b', // amber-500
      badgeClasses: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20',
      ctaClasses: 'bg-amber-50/70 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 text-amber-800 dark:text-amber-300',
      accentColor: 'from-amber-400 to-orange-500',
    };
  }
  return {
    label: 'Incomplete',
    color: '#ef4444', // red-500
    badgeClasses: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200/60 dark:border-red-500/20',
    ctaClasses: 'bg-red-50/70 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10 text-red-800 dark:text-red-300',
    accentColor: 'from-red-500 to-rose-500',
  };
};

// ── Component ─────────────────────────────────────────────────────────────────
const VaultHealthScore = ({ stats = {} }) => {
  const { score, results } = useMemo(() => calcScore(stats), [stats]);
  const status = getStatus(score);
  const missing = results.filter((r) => !r.met);

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.07)] overflow-hidden">
      {/* Top accent */}
      <div className="h-[3px] w-full" style={{ background: `linear-gradient(90deg, ${status.color}, ${status.color}66)` }} />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${status.badgeClasses}`}>
            <FaShieldAlt style={{ fontSize: '14px' }} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Vault Health Score
            </p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Emergency readiness rating
            </p>
          </div>
        </div>

        {/* Ring + Score */}
        <div className="flex items-center gap-6 mb-5">
          <div className="relative shrink-0">
            <ScoreRing score={score} color={status.color} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className="text-3xl font-black tabular-nums leading-none"
                style={{ color: status.color }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.4, type: 'spring' }}
              >
                {score}
              </motion.span>
              <span className="text-[10px] font-bold text-slate-400 mt-0.5">/ 100</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${status.badgeClasses}`}
            >
              {status.label}
            </div>
            <div className="space-y-1.5">
              {results.slice(0, 4).map((r) => (
                <div key={r.key} className="flex items-center gap-2 text-xs">
                  {r.met
                    ? <FaCheck className="shrink-0 text-emerald-500" style={{ fontSize: '10px' }} />
                    : <FaTimes className="shrink-0 text-slate-300 dark:text-slate-600" style={{ fontSize: '10px' }} />
                  }
                  <span className={r.met ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-400 dark:text-slate-500'}>
                    {r.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Missing items — actionable CTA */}
        {missing.length > 0 && (
          <div className={`rounded-xl p-4 space-y-2 ${status.ctaClasses}`}>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: status.color }}>
              Complete to improve score
            </p>
            {missing.slice(0, 3).map((r) => (
              <Link
                key={r.key}
                to={r.route}
                className="flex items-center justify-between group text-xs font-semibold hover:text-slate-900 dark:hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: status.color }} />
                  {r.label}
                </span>
                <FaArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontSize: '10px', color: status.color }} />
              </Link>
            ))}
          </div>
        )}

        {score === 100 && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
            <FaCheck style={{ fontSize: '13px' }} />
            <span className="text-xs font-bold">Your vault is fully emergency-ready!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VaultHealthScore;
