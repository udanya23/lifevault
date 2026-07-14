/**
 * pages/dashboard/DashboardPage.jsx — Main Workspace Dashboard
 *
 * Premium:
 * - Skeleton loaders with shimmer while loading
 * - Staggered Framer Motion entry for each row
 * - Updated StatsCard with iconVariant prop
 * - Refined layout with greeting header
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import {
  FaFolder,
  FaQrcode,
  FaUserFriends,
} from 'react-icons/fa';

import { dashboardAPI } from '@/api/dashboardAPI';
import { selectCurrentUser } from '@/features/auth/authSlice';
import StatsCard from '@/components/dashboard/StatsCard';
import VaultHealthScore from '@/components/dashboard/VaultHealthScore';
import QuickActionsCard from '@/components/dashboard/QuickActionsCard';
import RecentActivityFeed from '@/components/dashboard/RecentActivityFeed';
import HealthcareImage from '@/components/common/HealthcareImage';
import { HEALTHCARE_IMAGES } from '@/utils/imageAssets';

// ── Skeleton Loaders ──────────────────────────────────────────────────────────
const StatSkeleton = () => (
  <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm p-5 flex items-center justify-between">
    <div className="space-y-2.5 flex-1 pr-4">
      <div className="h-2.5 w-24 rounded-full skeleton" />
      <div className="h-7 w-16 rounded-lg skeleton" />
      <div className="h-2 w-20 rounded-full skeleton" />
    </div>
    <div className="w-12 h-12 rounded-xl skeleton shrink-0" />
  </div>
);

const CardSkeleton = ({ height = 'h-48' }) => (
  <div className={`${height} bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm p-6`}>
    <div className="h-3 w-32 rounded-full skeleton mb-5" />
    <div className="space-y-3">
      <div className="h-2.5 w-full rounded-full skeleton" />
      <div className="h-2.5 w-4/5 rounded-full skeleton" />
      <div className="h-2.5 w-3/5 rounded-full skeleton" />
    </div>
  </div>
);

// ── Stagger animation variants ────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

// ── Dashboard Page ────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const user = useSelector(selectCurrentUser) || {};
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: {
      contactsCount: 0,
      documentsCount: 0,
      scansCount: 0,
      profileCompletion: 20,
    },
    recentScans: [],
    recentLogs:  [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await dashboardAPI.getDashboardData();
        if (res.data?.success) setData(res.data.data);
      } catch {
        toast.error('Failed to load dashboard metrics. Reconnecting...');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Loading Skeleton Layout ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Greeting skeleton */}
        <div className="h-7 w-48 rounded-xl skeleton" />

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
        </div>

        {/* Middle row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <CardSkeleton height="h-52" />
          </div>
          <div className="lg:col-span-7">
            <CardSkeleton height="h-52" />
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton height="h-60" />
          <CardSkeleton height="h-60" />
        </div>
      </div>
    );
  }

  const { stats, recentScans, recentLogs } = data;
  const firstName = user.name?.split(' ')[0] || 'there';

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-7 text-left"
    >
      {/* ── Welcome Banner ────────────────────────────────────────────────────── */}
      <motion.div variants={item} className="relative h-[220px] rounded-2xl overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-slate-900/40">
        <HealthcareImage
          src={HEALTHCARE_IMAGES.dashboardBanner}
          alt="Medical dashboard and healthcare overview"
          className="absolute inset-0 h-full rounded-none shadow-none"
          rounded="rounded-none"
          hover
          placeholderLabel="Add dashboard-banner.jpg to public/images/"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/85 via-blue-800/70 to-blue-700/30 dark:from-slate-900/90 dark:via-slate-900/75 dark:to-transparent" aria-hidden="true" />
        <div className="absolute inset-0 flex items-center justify-between flex-wrap gap-3 px-6 sm:px-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Welcome back, {firstName} 👋
            </h2>
            <p className="text-sm text-blue-100/90 mt-1">
              Here's an overview of your LifeVault security status.
            </p>
          </div>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border backdrop-blur-sm ${
            stats.profileCompletion >= 80
              ? 'bg-emerald-500/20 text-emerald-100 border-emerald-400/30'
              : 'bg-white/15 text-white border-white/25'
          }`}>
            <span className={`w-2 h-2 rounded-full ${stats.profileCompletion >= 80 ? 'bg-emerald-400' : 'bg-blue-300'} animate-pulse`} aria-hidden="true" />
            Vault {stats.profileCompletion}% complete
          </div>
        </div>
      </motion.div>

      {/* ── Stats Row ─────────────────────────────────────────────────────────── */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <StatsCard
          title="Emergency Contacts"
          value={stats.contactsCount}
          icon={FaUserFriends}
          iconVariant="emerald"
          description="Next-of-kin registered"
        />
        <StatsCard
          title="Secure Documents"
          value={stats.documentsCount}
          icon={FaFolder}
          iconVariant="violet"
          description="Files in your vault"
        />
        <StatsCard
          title="QR Code Scans"
          value={stats.scansCount}
          icon={FaQrcode}
          iconVariant="red"
          description="Total emergency accesses"
        />
      </motion.div>

      {/* ── Vault Health Score + Quick Actions ─────────────────────────────── */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        <div className="lg:col-span-5">
          <VaultHealthScore stats={stats} />
        </div>
        <div className="lg:col-span-7">
          <QuickActionsCard />
        </div>
      </motion.div>

      {/* ── Profile Completion + Activity ──────────────────────────────────── */}
      <motion.div variants={item}>
        <RecentActivityFeed scans={recentScans} logs={recentLogs} />
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;
