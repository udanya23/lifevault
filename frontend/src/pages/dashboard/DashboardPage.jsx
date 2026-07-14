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
      {/* ── Welcome Banner (CSS Mesh Gradient — No Image Dependencies) ── */}
      <motion.div
        variants={item}
        className="relative h-[180px] rounded-2xl overflow-hidden shadow-md border border-slate-200/50 dark:border-slate-800/80 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-left"
      >
        {/* Soft glowing mesh circles */}
        <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[-150px] left-[-50px] w-[350px] h-[350px] bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Abstract futuristic grid lines */}
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="absolute inset-0 flex items-center justify-between flex-wrap gap-4 px-6 sm:px-8 z-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
              Welcome back, {firstName} 👋
            </h2>
            <p className="text-xs sm:text-sm text-blue-200/80 mt-1.5 font-medium max-w-[280px] sm:max-w-none">
              Here's an overview of your LifeVault security status.
            </p>
          </div>
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border backdrop-blur-md shadow-sm ${
            stats.profileCompletion >= 80
              ? 'bg-emerald-500/20 text-emerald-100 border-emerald-400/30'
              : 'bg-white/10 text-white border-white/20'
          }`}>
            <span className={`w-2 h-2 rounded-full ${stats.profileCompletion >= 80 ? 'bg-emerald-400' : 'bg-blue-400'} animate-pulse`} aria-hidden="true" />
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
