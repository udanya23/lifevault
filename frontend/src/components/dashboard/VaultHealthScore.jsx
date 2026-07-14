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
      <circle cx="70" cy="70" r={R} fill="none" stroke="#f1f5f9" strokeWidth="12" />
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
  if (score >= 90) return { label: 'Excellent',    color: '#16a34a', bg: '#f0fdf4', textClass: 'text-emerald-600' };
  if (score >= 70) return { label: 'Good',         color: '#2563eb', bg: '#eff6ff', textClass: 'text-blue-600' };
  if (score >= 50) return { label: 'Needs Work',   color: '#d97706', bg: '#fffbeb', textClass: 'text-amber-600' };
  return               { label: 'Incomplete',   color: '#dc2626', bg: '#fef2f2', textClass: 'text-red-600' };
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
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: status.bg }}>
            <FaShieldAlt style={{ color: status.color, fontSize: '14px' }} />
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
              className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
              style={{ backgroundColor: status.bg, color: status.color }}
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
          <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: status.bg }}>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: status.color }}>
              Complete to improve score
            </p>
            {missing.slice(0, 3).map((r) => (
              <Link
                key={r.key}
                to={r.route}
                className="flex items-center justify-between group text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
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
