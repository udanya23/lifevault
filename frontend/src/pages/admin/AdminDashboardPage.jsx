/**
 * pages/admin/AdminDashboardPage.jsx — Admin Analytics Dashboard
 *
 * Platform-wide stats, registration trend, QR scan trend, document
 * breakdown, recent signups, recent scans, and top system actions.
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  FaUsers,
  FaUserCheck,
  FaUserSlash,
  FaUserClock,
  FaFileAlt,
  FaQrcode,
  FaStream,
  FaPhoneAlt,
  FaArrowRight,
  FaClipboardList,
} from 'react-icons/fa';

import {
  fetchAnalytics,
  fetchReports,
  selectAdminAnalytics,
  selectAdminReports,
  selectAdminLoading,
} from '@/features/admin/adminSlice';
import { ROUTES } from '@/utils/constants';
import { formatDate, formatRelativeTime } from '@/utils/helpers';
import StatsCard from '@/components/dashboard/StatsCard';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';

const DOC_TYPE_LABELS = {
  aadhaar: 'Aadhaar',
  pan: 'PAN Card',
  passport: 'Passport',
  drivingLicense: 'Driving License',
  insurance: 'Insurance',
  medicalReport: 'Medical Report',
  other: 'Other',
};

const DOC_TYPE_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-slate-400',
];

// ── Skeletons ─────────────────────────────────────────────────────────────────
const StatSkeleton = () => (
  <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm p-5 flex items-center justify-between">
    <div className="space-y-2.5 flex-1 pr-4">
      <div className="h-2.5 w-24 rounded-full skeleton" />
      <div className="h-7 w-16 rounded-lg skeleton" />
    </div>
    <div className="w-12 h-12 rounded-xl skeleton shrink-0" />
  </div>
);

const CardSkeleton = ({ height = 'h-64' }) => (
  <div className={`${height} bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm p-6`}>
    <div className="h-3 w-40 rounded-full skeleton mb-5" />
    <div className="space-y-3">
      <div className="h-2.5 w-full rounded-full skeleton" />
      <div className="h-2.5 w-4/5 rounded-full skeleton" />
      <div className="h-2.5 w-3/5 rounded-full skeleton" />
    </div>
  </div>
);

const SectionTitle = ({ children, action }) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{children}</h3>
    {action}
  </div>
);

const AdminDashboardPage = () => {
  const dispatch = useDispatch();
  const analytics = useSelector(selectAdminAnalytics);
  const reports = useSelector(selectAdminReports);
  const isLoading = useSelector(selectAdminLoading);

  useEffect(() => {
    dispatch(fetchAnalytics());
    dispatch(fetchReports({ limit: 8 }));
  }, [dispatch]);

  if (isLoading || !analytics) {
    return (
      <div className="space-y-6">
        <div className="h-7 w-56 rounded-xl skeleton" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton /><CardSkeleton />
        </div>
      </div>
    );
  }

  const {
    stats,
    recentUsers,
    registrationTrend,
    documentsByType = [],
    scanTrend = [],
    recentScans = [],
    topActions = [],
  } = analytics;

  const totalDocsForBreakdown = documentsByType.reduce((sum, d) => sum + d.count, 0) || 1;
  const maxAction = topActions[0]?.count || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 text-left"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
            Admin Control Center
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Platform analytics and system oversight
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={ROUTES.ADMIN_ACTIVITY}>
            <Button variant="outline" icon={FaClipboardList}>
              System Activity
            </Button>
          </Link>
          <Link to={ROUTES.ADMIN_USERS}>
            <Button icon={FaUsers}>Manage Users</Button>
          </Link>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={FaUsers}
          iconVariant="blue"
          badgeText={`+${stats.newUsersThisMonth} this month`}
        />
        <StatsCard
          title="Active Users"
          value={stats.activeUsers}
          icon={FaUserCheck}
          iconVariant="emerald"
          description="Verified & in good standing"
        />
        <StatsCard
          title="Suspended"
          value={stats.suspendedUsers}
          icon={FaUserSlash}
          iconVariant="red"
          description="Access revoked by admin"
        />
        <StatsCard
          title="Unverified Emails"
          value={stats.unverifiedUsers ?? Math.max(0, stats.totalUsers - stats.verifiedUsers)}
          icon={FaUserClock}
          iconVariant="amber"
          description="Pending email verification"
        />
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Vault Documents"
          value={stats.totalDocuments}
          icon={FaFileAlt}
          iconVariant="violet"
        />
        <StatsCard
          title="QR Scans"
          value={stats.totalScans}
          icon={FaQrcode}
          iconVariant="sky"
          badgeText={stats.scansThisMonth != null ? `${stats.scansThisMonth} this month` : undefined}
        />
        <StatsCard
          title="Timeline Events"
          value={stats.totalTimelineEvents ?? 0}
          icon={FaStream}
          iconVariant="emerald"
        />
        <StatsCard
          title="Emergency Contacts"
          value={stats.totalContacts ?? 0}
          icon={FaPhoneAlt}
          iconVariant="red"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Trend */}
        <Card>
          <SectionTitle>User Registrations (Last 6 Months)</SectionTitle>
          {registrationTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={registrationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Signups" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500 py-8 text-center">No registration data yet</p>
          )}
        </Card>

        {/* QR Scan Trend */}
        <Card>
          <SectionTitle>Emergency QR Scans (Last 7 Days)</SectionTitle>
          {scanTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={scanTrend}>
                <defs>
                  <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Scans"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  fill="url(#scanGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500 py-8 text-center">No scan data yet</p>
          )}
        </Card>
      </div>

      {/* Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Documents by Type */}
        <Card>
          <SectionTitle>Documents by Type</SectionTitle>
          {documentsByType.length > 0 ? (
            <ul className="space-y-3.5">
              {documentsByType.map((doc, i) => (
                <li key={doc.type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {DOC_TYPE_LABELS[doc.type] || doc.type}
                    </span>
                    <span className="text-xs font-bold text-slate-500 tabular-nums">{doc.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${DOC_TYPE_COLORS[i % DOC_TYPE_COLORS.length]}`}
                      style={{ width: `${Math.max(4, (doc.count / totalDocsForBreakdown) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 py-8 text-center">No documents uploaded yet</p>
          )}
        </Card>

        {/* Top System Actions */}
        <Card>
          <SectionTitle>Top Actions (Last 7 Days)</SectionTitle>
          {topActions.length > 0 ? (
            <ul className="space-y-3.5">
              {topActions.map((item) => (
                <li key={item.action}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate pr-2">
                      {item.action}
                    </span>
                    <span className="text-xs font-bold text-slate-500 tabular-nums">{item.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                      style={{ width: `${Math.max(4, (item.count / maxAction) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 py-8 text-center">No activity this week</p>
          )}
        </Card>

        {/* Recent QR Scans */}
        <Card>
          <SectionTitle>Recent QR Scans</SectionTitle>
          {recentScans.length > 0 ? (
            <ul className="space-y-3">
              {recentScans.map((scan) => (
                <li
                  key={scan._id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {scan.userId?.name || 'Unknown user'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {scan.scannerArea && scan.scannerArea !== 'Unknown'
                        ? scan.scannerArea
                        : 'Location unknown'}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2 shrink-0">
                    {formatRelativeTime(scan.scannedAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 py-8 text-center">No scans recorded yet</p>
          )}
        </Card>
      </div>

      {/* Recent Signups + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <SectionTitle
            action={
              <Link
                to={ROUTES.ADMIN_USERS}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View all <FaArrowRight className="h-3 w-3" />
              </Link>
            }
          >
            Recent Signups
          </SectionTitle>
          {recentUsers?.length > 0 ? (
            <ul className="space-y-3">
              {recentUsers.map((user) => (
                <li
                  key={user._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar src={user.profilePhoto?.url} name={user.name} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                    {user.isSuspended ? (
                      <Badge variant="danger" size="sm">Suspended</Badge>
                    ) : user.isEmailVerified ? (
                      <Badge variant="success" size="sm">Verified</Badge>
                    ) : (
                      <Badge variant="warning" size="sm">Unverified</Badge>
                    )}
                    <span className="text-[10px] text-slate-400">
                      {formatDate(user.createdAt, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 py-8 text-center">No users yet</p>
          )}
        </Card>

        <Card>
          <SectionTitle
            action={
              <Link
                to={ROUTES.ADMIN_ACTIVITY}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View all <FaArrowRight className="h-3 w-3" />
              </Link>
            }
          >
            Latest System Activity
          </SectionTitle>
          {reports?.length > 0 ? (
            <ul className="space-y-2.5">
              {reports.map((log) => (
                <li
                  key={log._id}
                  className="flex items-start justify-between gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="info" size="sm">{log.action}</Badge>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {log.userId?.name || 'System'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 truncate">{log.description}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0 mt-0.5">
                    {formatRelativeTime(log.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 py-8 text-center">No activity reports yet</p>
          )}
        </Card>
      </div>
    </motion.div>
  );
};

export default AdminDashboardPage;
