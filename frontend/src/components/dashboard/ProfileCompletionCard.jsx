/**
 * components/dashboard/ProfileCompletionCard.jsx — Vault Completion Widget
 *
 * Premium: gradient progress bar, animated fill, glow at 100%, segmented steps.
 */

import { Link } from 'react-router-dom';
import { FaCheckCircle, FaExclamationCircle, FaArrowRight, FaShieldAlt } from 'react-icons/fa';
import { ROUTES } from '@/utils/constants';

const ProfileCompletionCard = ({ stats = {} }) => {
  const completion = stats.profileCompletion || 20;

  const clampedCompletion = Math.min(100, Math.max(0, completion));

  // Color thresholds
  const progressColor =
    clampedCompletion >= 80
      ? 'from-emerald-500 to-teal-500'
      : clampedCompletion >= 50
      ? 'from-blue-500 to-indigo-500'
      : 'from-amber-400 to-orange-500';

  const badgeColor =
    clampedCompletion >= 80
      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20'
      : clampedCompletion >= 50
      ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20'
      : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20';

  const recommendations = [];
  if (clampedCompletion < 100) {
    if (!stats.contactsCount || stats.contactsCount === 0) {
      recommendations.push({ text: 'Add at least one Emergency Contact (+20%)', path: ROUTES.PROFILE });
    }
    if (clampedCompletion <= 45) {
      recommendations.push({ text: 'Fill out your personal details (+25%)', path: ROUTES.PROFILE });
      recommendations.push({ text: 'Add medical allergies & medications (+25%)', path: ROUTES.PROFILE });
    } else if (clampedCompletion <= 70) {
      recommendations.push({ text: 'Review your medical profile (+25%)', path: ROUTES.PROFILE });
    }
    if (!stats.documentsCount || stats.documentsCount === 0) {
      recommendations.push({ text: 'Upload health insurance card or ID (+10%)', path: ROUTES.DOCUMENTS });
    }
  }

  return (
    <div className="relative bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm p-6 flex flex-col justify-between text-left overflow-hidden">
      {/* Subtle background glow when complete */}
      {clampedCompletion === 100 && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 dark:from-emerald-900/10 dark:to-teal-900/5 pointer-events-none rounded-2xl" />
      )}

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FaShieldAlt
              className={`h-4 w-4 ${clampedCompletion === 100 ? 'text-emerald-500' : 'text-slate-400'}`}
              aria-hidden="true"
            />
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Vault Completion
            </h3>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${badgeColor}`}>
            {clampedCompletion}% Ready
          </span>
        </div>

        {/* Progress Bar */}
        <div
          role="progressbar"
          aria-valuenow={clampedCompletion}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Vault completion: ${clampedCompletion}%`}
          className="w-full bg-slate-100 dark:bg-slate-700/60 rounded-full h-2.5 mb-5 overflow-hidden"
        >
          <div
            className={`h-full rounded-full bg-gradient-to-r ${progressColor} transition-all duration-700 ease-out relative`}
            style={{ width: `${clampedCompletion}%` }}
          >
            {/* Shimmer animation on the bar */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-[shimmer_2s_infinite]" aria-hidden="true" />
          </div>
        </div>

        {/* Checklist / Success State */}
        {clampedCompletion === 100 ? (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/30">
            <FaCheckCircle className="h-5 w-5 shrink-0 text-emerald-500 dark:text-emerald-400 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                Your Vault is fully secured! 🎉
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 leading-relaxed">
                All critical details are synced. Responders can retrieve aid data during active scans.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
              Next steps to reach 100%
            </p>
            {recommendations.slice(0, 3).map((rec, i) => (
              <Link
                key={i}
                to={rec.path}
                className="group flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:border-blue-200 dark:hover:border-blue-800/50 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-all duration-150 cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FaExclamationCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" aria-hidden="true" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    {rec.text}
                  </span>
                </div>
                <FaArrowRight
                  className="h-3 w-3 text-slate-300 dark:text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      {clampedCompletion < 100 && (
        <div className="relative mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            {100 - clampedCompletion}% remaining
          </span>
          <Link
            to={ROUTES.PROFILE}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group"
          >
            Complete Setup
            <FaArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProfileCompletionCard;
