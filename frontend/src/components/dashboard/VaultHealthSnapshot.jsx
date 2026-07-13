/**
 * components/dashboard/VaultHealthSnapshot.jsx — Live Medical Summary Card
 *
 * Shows a at-a-glance health summary pulled from the medical + profile data.
 * Helps users verify their emergency data is up to date right from the dashboard.
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  FaHeartbeat,
  FaAllergies,
  FaPills,
  FaTint,
  FaSyringe,
  FaArrowRight,
  FaExclamationTriangle,
  FaLeaf,
} from 'react-icons/fa';

import {
  fetchMedicalInfo,
  selectMedical,
} from '@/features/medical/medicalSlice';
import { fetchProfile, selectProfile } from '@/features/profile/profileSlice';
import { ROUTES } from '@/utils/constants';
import { getBloodGroupColor } from '@/utils/helpers';

const Pill = ({ label, icon: Icon, color = 'slate', onClick }) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold
      bg-${color}-50 dark:bg-${color}-500/10
      text-${color}-700 dark:text-${color}-400
      border border-${color}-200/60 dark:border-${color}-500/20`}
  >
    {Icon && <Icon className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />}
    {label}
  </span>
);

const VaultHealthSnapshot = () => {
  const dispatch = useDispatch();
  const medical = useSelector(selectMedical);
  const profile = useSelector(selectProfile);

  useEffect(() => {
    if (!medical) dispatch(fetchMedicalInfo());
    if (!profile) dispatch(fetchProfile());
  }, [dispatch, medical, profile]);

  const bloodGroup = profile?.bloodGroup && profile.bloodGroup !== 'unknown' ? profile.bloodGroup : null;
  const isOrganDonor = profile?.isOrganDonor;
  const allergies = medical?.allergies || [];
  const chronicDiseases = medical?.chronicDiseases || [];
  const medicines = medical?.currentMedicines || [];
  const hasNotes = !!medical?.medicalNotes;

  const isEmpty = !bloodGroup && !allergies.length && !chronicDiseases.length && !medicines.length;

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm p-6 text-left h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <FaHeartbeat className="h-4 w-4 text-red-500" aria-hidden="true" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Health Snapshot
          </h3>
        </div>
        <Link
          to={ROUTES.PROFILE}
          className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1 group"
        >
          Update
          <FaArrowRight className="h-2.5 w-2.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
        </Link>
      </div>

      {isEmpty ? (
        /* Empty state */
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
            <FaExclamationTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No medical data yet</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed max-w-[200px]">
              Add your blood group, allergies, and conditions so responders have everything they need.
            </p>
          </div>
          <Link
            to={ROUTES.PROFILE}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Fill Medical Profile →
          </Link>
        </div>
      ) : (
        <div className="flex-1 space-y-4">
          {/* Blood Group row */}
          {bloodGroup && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest w-20 shrink-0">
                Blood Type
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${getBloodGroupColor(bloodGroup)}`}
              >
                <FaTint className="h-2.5 w-2.5" aria-hidden="true" />
                {bloodGroup}
              </span>
              {isOrganDonor && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                  <FaLeaf className="h-2.5 w-2.5" aria-hidden="true" />
                  Organ Donor
                </span>
              )}
            </div>
          )}

          {/* Allergies row */}
          {allergies.length > 0 && (
            <div className="flex items-start gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest w-20 shrink-0 mt-0.5">
                Allergies
              </span>
              <div className="flex flex-wrap gap-1.5 flex-1">
                {allergies.slice(0, 4).map((a, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200/60 dark:border-red-500/20"
                  >
                    <FaAllergies className="h-2.5 w-2.5" aria-hidden="true" />
                    {a}
                  </span>
                ))}
                {allergies.length > 4 && (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold self-center">
                    +{allergies.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Chronic diseases row */}
          {chronicDiseases.length > 0 && (
            <div className="flex items-start gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest w-20 shrink-0 mt-0.5">
                Conditions
              </span>
              <div className="flex flex-wrap gap-1.5 flex-1">
                {chronicDiseases.slice(0, 3).map((d, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-200/60 dark:border-orange-500/20"
                  >
                    <FaSyringe className="h-2.5 w-2.5" aria-hidden="true" />
                    {d}
                  </span>
                ))}
                {chronicDiseases.length > 3 && (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold self-center">
                    +{chronicDiseases.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Medicines row */}
          {medicines.length > 0 && (
            <div className="flex items-start gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest w-20 shrink-0 mt-0.5">
                Medicines
              </span>
              <div className="flex flex-wrap gap-1.5 flex-1">
                {medicines.slice(0, 3).map((m, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20"
                  >
                    <FaPills className="h-2.5 w-2.5" aria-hidden="true" />
                    {m}
                  </span>
                ))}
                {medicines.length > 3 && (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold self-center">
                    +{medicines.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Medical notes indicator */}
          {hasNotes && (
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/50">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" aria-hidden="true" />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                First aid instructions saved — visible to responders on scan.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VaultHealthSnapshot;
