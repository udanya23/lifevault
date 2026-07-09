/**
 * pages/profile/ProfilePage.jsx — Tabbed Profile Manager Screen
 *
 * Premium:
 * - Rounded tab selectors with interactive sliding hover/active backgrounds
 * - Premium gradient header layout
 * - Card container matching modern premium design guidelines
 */

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaPhone, FaHeartbeat } from 'react-icons/fa';

import { fetchProfile } from '@/features/profile/profileSlice';
import PersonalInfoTab from './PersonalInfoTab';
import EmergencyContactsTab from './EmergencyContactsTab';
import MedicalInfoTab from './MedicalInfoTab';
import Card from '@/components/common/Card';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'contacts' | 'medical'

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const tabs = [
    {
      id: 'personal',
      label: 'Personal Details',
      icon: FaUser,
    },
    {
      id: 'contacts',
      label: 'Emergency Contacts',
      icon: FaPhone,
    },
    {
      id: 'medical',
      label: 'Medical Info',
      icon: FaHeartbeat,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="text-left">
        <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
          Manage Profile Information
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure personal details, emergency responders logs, and next-of-kin contacts.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200/80 dark:border-slate-800 gap-1 overflow-x-auto select-none no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex items-center gap-2 py-3 px-4 text-xs md:text-sm font-bold transition-colors cursor-pointer outline-none shrink-0
                ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }
              `}
            >
              <tab.icon className="h-4 w-4 shrink-0" />
              <span>{tab.label}</span>

              {/* Active Tab sliding highlight bar */}
              {isActive && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 inset-x-0 h-[3px] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents Frame */}
      <Card
        padding="lg"
        variant="default"
        className="border border-slate-200/80 dark:border-slate-700/60 shadow-sm min-h-[400px] text-left"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'personal' && <PersonalInfoTab />}
            {activeTab === 'contacts' && <EmergencyContactsTab />}
            {activeTab === 'medical' && <MedicalInfoTab />}
          </motion.div>
        </AnimatePresence>
      </Card>
    </div>
  );
};

export default ProfilePage;
