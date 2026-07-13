/**
 * pages/emergency/EmergencyPage.jsx — Public Emergency Profile
 *
 * Premium:
 * - Floating high-end emergency banner with live animated pulse dot
 * - Grid card components for allergies, medications, next-of-kin, and chronic diseases
 * - Organ donor badge prominently displayed
 * - Medical notes / first-aid instructions card
 * - Highlighted direct action contact dialer buttons with green gradients
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaHeartbeat,
  FaPhone,
  FaPills,
  FaAllergies,
  FaTint,
  FaExclamationTriangle,
  FaSpinner,
  FaLeaf,
  FaNotesMedical,
  FaSyringe,
  FaShare,
  FaCheckCircle,
} from 'react-icons/fa';

import { emergencyAPI } from '@/api/emergencyAPI';
import { getBloodGroupColor } from '@/utils/helpers';
import Badge from '@/components/common/Badge';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

const EmergencyPage = () => {
  const { qrToken } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    const fetchEmergency = async () => {
      try {
        const response = await emergencyAPI.getEmergencyInfo(qrToken);
        if (response.data?.success) {
          setData(response.data.data);
        } else {
          setError('Emergency profile not found.');
        }
      } catch (err) {
        setError(
          err.response?.data?.message || 'Unable to load emergency information.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (qrToken) fetchEmergency();
  }, [qrToken]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${data?.name} — Emergency Medical Profile`,
          text: 'Emergency medical information for first responders.',
          url,
        });
        setShared(true);
        setTimeout(() => setShared(false), 3000);
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-3">
          <FaSpinner className="h-9 w-9 text-blue-600 animate-spin mx-auto" aria-hidden="true" />
          <p className="text-sm font-semibold text-slate-500">Retrieving emergency profile…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="text-center max-w-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-500 mx-auto">
            <FaExclamationTriangle className="h-8 w-8 animate-bounce" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Profile Not Available
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Emergency Header Banner */}
      <div className="bg-red-600 dark:bg-red-900 text-white py-3 px-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse shrink-0" aria-hidden="true" />
            <span className="text-xs font-extrabold tracking-widest uppercase">
              Emergency Medical Profile
            </span>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
            aria-label="Share emergency profile link"
          >
            {shared ? <FaCheckCircle className="h-3 w-3" /> : <FaShare className="h-3 w-3" />}
            {shared ? 'Copied!' : 'Share'}
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4 text-left"
        >
          {/* Patient Identity */}
          <motion.div variants={item}>
            <Card variant="default" className="text-center flex flex-col items-center p-6 border-slate-200 dark:border-slate-800">
              <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-500 mb-3 shadow-[0_2px_12px_rgba(239,68,68,0.25)]">
                <FaHeartbeat className="h-7 w-7" aria-hidden="true" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {data.name}
              </h1>

              {/* Blood Group + Organ Donor row */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                {data.bloodGroup && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${getBloodGroupColor(data.bloodGroup)}`}
                  >
                    <FaTint className="h-3.5 w-3.5" aria-hidden="true" />
                    Blood: {data.bloodGroup}
                  </span>
                )}
                {data.isOrganDonor && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800">
                    <FaLeaf className="h-3 w-3" aria-hidden="true" />
                    Organ Donor
                  </span>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Medical Notes (First-aid instructions) — shown first, responders read it first */}
          {data.medicalNotes && (
            <motion.div variants={item}>
              <Card variant="default" className="border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-amber-500" aria-hidden="true" />
                <h2 className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2 mb-3 select-none pl-1">
                  <FaNotesMedical aria-hidden="true" /> First Aid Instructions
                </h2>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed pl-1">
                  {data.medicalNotes}
                </p>
              </Card>
            </motion.div>
          )}

          {/* Allergies — Critical */}
          {data.allergies?.length > 0 && (
            <motion.div variants={item}>
              <Card variant="default" className="border-red-200 dark:border-red-900/60 bg-red-50/10 dark:bg-red-950/5 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-red-500" aria-hidden="true" />
                <h2 className="text-xs font-bold text-red-750 dark:text-red-400 flex items-center gap-2 mb-3 select-none pl-1">
                  <FaAllergies aria-hidden="true" /> ⚠ Known Allergies
                </h2>
                <div className="flex flex-wrap gap-1.5 pl-1">
                  {data.allergies.map((allergy, i) => (
                    <Badge key={i} variant="danger" size="sm">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Chronic Diseases / Conditions */}
          {data.chronicDiseases?.length > 0 && (
            <motion.div variants={item}>
              <Card variant="default" className="border-orange-200 dark:border-orange-900/50 bg-orange-50/10 dark:bg-orange-950/5 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-orange-500" aria-hidden="true" />
                <h2 className="text-xs font-bold text-orange-800 dark:text-orange-400 flex items-center gap-2 mb-3 select-none pl-1">
                  <FaSyringe aria-hidden="true" /> Chronic Conditions
                </h2>
                <div className="flex flex-wrap gap-1.5 pl-1">
                  {data.chronicDiseases.map((disease, i) => (
                    <Badge key={i} variant="warning" size="sm">
                      {disease}
                    </Badge>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Current Medicines */}
          {data.currentMedicines?.length > 0 && (
            <motion.div variants={item}>
              <Card variant="default" className="border-slate-200 dark:border-slate-800 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-blue-500" aria-hidden="true" />
                <h2 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-3 select-none pl-1">
                  <FaPills className="text-blue-500" aria-hidden="true" /> Current Medications
                </h2>
                <ul className="space-y-2 pl-1">
                  {data.currentMedicines.map((med, i) => (
                    <li
                      key={i}
                      className="text-xs font-semibold text-slate-700 dark:text-slate-300 pl-3 border-l-2 border-blue-400"
                    >
                      {med}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          )}

          {/* Emergency Contacts */}
          {data.emergencyContacts?.length > 0 && (
            <motion.div variants={item}>
              <Card variant="default" className="border-slate-200 dark:border-slate-800 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-emerald-500" aria-hidden="true" />
                <h2 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4 select-none pl-1">
                  <FaPhone className="text-emerald-500" aria-hidden="true" /> Next-of-Kin Contacts
                </h2>
                <div className="space-y-2.5 pl-1">
                  {data.emergencyContacts.map((contact, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-850 dark:text-white flex items-center gap-1.5 flex-wrap">
                          {contact.name}
                          {contact.isPrimary && (
                            <Badge variant="primary" size="sm" className="font-extrabold uppercase text-[8px]">
                              Primary
                            </Badge>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">{contact.relationship}</p>
                      </div>
                      <a href={`tel:${contact.phone}`}>
                        <Button variant="success" size="xs" icon={FaPhone}>
                          Call
                        </Button>
                      </a>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Footer */}
          <motion.p variants={item} className="text-center text-[10px] text-slate-400 dark:text-slate-500 pt-4 font-semibold">
            Powered by LifeVault — Zero-Knowledge Emergency Access. Private documents remain locked.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default EmergencyPage;
