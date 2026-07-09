/**
 * pages/emergency/EmergencyPage.jsx — Public Emergency Profile
 *
 * Premium:
 * - Floating high-end emergency banner with live animated pulse dot
 * - Grid card components for allergies, medications, and next-of-kin contacts
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
} from 'react-icons/fa';

import { emergencyAPI } from '@/api/emergencyAPI';
import { getBloodGroupColor } from '@/utils/helpers';
import Badge from '@/components/common/Badge';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

const EmergencyPage = () => {
  const { qrToken } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

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
            <p className="text-xs text-slate-505 dark:text-slate-400 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Emergency Header Banner */}
      <div className="bg-red-650 dark:bg-red-900 text-white py-3 px-4 text-center sticky top-0 z-50 flex items-center justify-center gap-2 shadow-md">
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" aria-hidden="true" />
        <span className="text-xs font-extrabold tracking-widest uppercase">
          Emergency Medical Profile
        </span>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-5 text-left"
        >
          {/* Patient Identity */}
          <Card variant="default" className="text-center flex flex-col items-center p-6 border-slate-205 dark:border-slate-800">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-500 mb-3 shadow-[0_2px_10px_rgba(239,68,68,0.2)]">
              <FaHeartbeat className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {data.name}
            </h1>
            {data.bloodGroup && (
              <div className="mt-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${getBloodGroupColor(data.bloodGroup)}`}
                >
                  <FaTint className="h-3.5 w-3.5" aria-hidden="true" />
                  Blood Group: {data.bloodGroup}
                </span>
              </div>
            )}
          </Card>

          {/* Allergies — Critical */}
          {data.allergies?.length > 0 && (
            <Card variant="default" className="border-red-200 dark:border-red-900/60 bg-red-50/10 dark:bg-red-950/5 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-red-500" aria-hidden="true" />
              <h2 className="text-xs font-bold text-red-750 dark:text-red-400 flex items-center gap-2 mb-3 select-none pl-1">
                <FaAllergies aria-hidden="true" /> Known Allergies
              </h2>
              <div className="flex flex-wrap gap-1.5 pl-1">
                {data.allergies.map((allergy, i) => (
                  <Badge key={i} variant="danger" size="sm">
                    {allergy}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Current Medicines */}
          {data.currentMedicines?.length > 0 && (
            <Card variant="default" className="border-slate-205 dark:border-slate-800 relative overflow-hidden">
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
          )}

          {/* Emergency Contacts */}
          {data.emergencyContacts?.length > 0 && (
            <Card variant="default" className="border-slate-205 dark:border-slate-800 relative overflow-hidden">
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
                    <a
                      href={`tel:${contact.phone}`}
                    >
                      <Button variant="success" size="xs" icon={FaPhone}>
                        Call
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Footer */}
          <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 pt-4 font-semibold">
            Powered by LifeVault — Zero-Knowledge Emergency Access. Private documents remain locked.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default EmergencyPage;
