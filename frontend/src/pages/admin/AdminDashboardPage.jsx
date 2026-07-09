/**
 * pages/admin/AdminDashboardPage.jsx — Admin Analytics Dashboard
 *
 * Platform-wide stats, registration trend chart, recent signups,
 * and system activity reports.
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
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
  FaFileAlt,
  FaQrcode,
  FaSpinner,
  FaArrowRight,
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

const AdminDashboardPage = () => {
  const dispatch = useDispatch();
  const analytics = useSelector(selectAdminAnalytics);
  const reports = useSelector(selectAdminReports);
  const isLoading = useSelector(selectAdminLoading);

  useEffect(() => {
    dispatch(fetchAnalytics());
    dispatch(fetchReports({ limit: 10 }));
  }, [dispatch]);

  if (isLoading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <FaSpinner className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const { stats, recentUsers, registrationTrend } = analytics;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 text-left"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
            Admin Control Center
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Platform analytics and system oversight
          </p>
        </div>
        <Link to={ROUTES.ADMIN_USERS}>
          <Button icon={FaUsers} iconPosition="left">
            Manage Users
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={FaUsers}
          badgeText={`+${stats.newUsersThisMonth} this month`}
          iconColor="text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400"
        />
        <StatsCard
          title="Active Users"
          value={stats.activeUsers}
          icon={FaUserCheck}
          iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400"
        />
        <StatsCard
          title="Suspended"
          value={stats.suspendedUsers}
          icon={FaUserSlash}
          iconColor="text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400"
        />
        <StatsCard
          title="Verified Emails"
          value={stats.verifiedUsers}
          icon={FaUserCheck}
          iconColor="text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 dark:text-indigo-400"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatsCard
          title="Total Documents"
          value={stats.totalDocuments}
          icon={FaFileAlt}
          iconColor="text-purple-600 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-400"
        />
        <StatsCard
          title="QR Scans"
          value={stats.totalScans}
          icon={FaQrcode}
          iconColor="text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Trend Chart */}
        <Card>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            User Registrations (Last 6 Months)
          </h3>
          {registrationTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={registrationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500 py-8 text-center">No registration data yet</p>
          )}
        </Card>

        {/* Recent Signups */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent Signups
            </h3>
            <Link
              to={ROUTES.ADMIN_USERS}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View all <FaArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="space-y-3">
            {recentUsers?.map((user) => (
              <li
                key={user._id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                  {user.isSuspended ? (
                    <Badge variant="danger">Suspended</Badge>
                  ) : user.isEmailVerified ? (
                    <Badge variant="success">Verified</Badge>
                  ) : (
                    <Badge variant="warning">Unverified</Badge>
                  )}
                  <span className="text-[10px] text-slate-400">
                    {formatDate(user.createdAt, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* System Activity Reports */}
      <Card>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
          System Activity Reports
        </h3>
        {reports?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 px-3 text-xs font-bold text-slate-500 uppercase">
                    Action
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-slate-500 uppercase">
                    User
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">
                    Description
                  </th>
                  <th className="text-right py-2 px-3 text-xs font-bold text-slate-500 uppercase">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {reports.map((log) => (
                  <tr
                    key={log._id}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  >
                    <td className="py-3 px-3">
                      <Badge variant="info">{log.action}</Badge>
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                      {log.userId?.name || 'System'}
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-xs hidden md:table-cell max-w-xs truncate">
                      {log.description}
                    </td>
                    <td className="py-3 px-3 text-right text-xs text-slate-400 whitespace-nowrap">
                      {formatRelativeTime(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500 py-6 text-center">No activity reports yet</p>
        )}
      </Card>
    </motion.div>
  );
};

export default AdminDashboardPage;
