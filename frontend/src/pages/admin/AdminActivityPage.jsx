/**
 * pages/admin/AdminActivityPage.jsx — System Activity Reports
 *
 * Full audit trail with search, action filter, date range, and pagination.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  FaSearch,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaArrowLeft,
  FaClipboardList,
  FaTimes,
} from 'react-icons/fa';

import {
  fetchReports,
  selectAdminReports,
  selectAdminReportsMeta,
  selectAdminReportsLoading,
} from '@/features/admin/adminSlice';
import { ROUTES } from '@/utils/constants';
import { formatDate, formatRelativeTime } from '@/utils/helpers';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';

const ACTION_BADGE_VARIANTS = [
  { match: /delete|suspend|fail/i, variant: 'danger' },
  { match: /login|register|verify/i, variant: 'success' },
  { match: /scan|qr/i, variant: 'info' },
  { match: /update|edit|change/i, variant: 'warning' },
  { match: /admin/i, variant: 'purple' },
];

const getActionVariant = (action = '') =>
  ACTION_BADGE_VARIANTS.find((v) => v.match.test(action))?.variant || 'default';

const AdminActivityPage = () => {
  const dispatch = useDispatch();
  const reports = useSelector(selectAdminReports);
  const meta = useSelector(selectAdminReportsMeta);
  const isLoading = useSelector(selectAdminReportsLoading);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    dispatch(
      fetchReports({
        page,
        limit: 20,
        search: search.trim() || undefined,
        action: action || undefined,
        from: from || undefined,
        to: to || undefined,
      })
    );
  }, [dispatch, page, search, action, from, to]);

  const hasFilters = search || action || from || to;

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setAction('');
    setFrom('');
    setTo('');
    setPage(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 text-left"
    >
      {/* Header */}
      <div>
        <Link
          to={ROUTES.ADMIN}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-2"
        >
          <FaArrowLeft className="h-3 w-3" /> Back to Admin Overview
        </Link>
        <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
          System Activity
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {meta.total} log entr{meta.total !== 1 ? 'ies' : 'y'} · full platform audit trail
        </p>
      </div>

      {/* Filters */}
      <Card padding="md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2">
            <Input
              label="Search"
              placeholder="Action or description..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              icon={FaSearch}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
              Action
            </label>
            <select
              value={action}
              onChange={(e) => { setAction(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100"
            >
              <option value="">All actions</option>
              {(meta.actions || []).map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
              From
            </label>
            <input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(e) => { setFrom(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
              To
            </label>
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => { setTo(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
        {hasFilters && (
          <div className="mt-3">
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-500 cursor-pointer"
            >
              <FaTimes className="h-3 w-3" /> Clear filters
            </button>
          </div>
        )}
      </Card>

      {/* Logs Table */}
      <Card padding="none" className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <FaSpinner className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="py-16 text-center">
            <FaClipboardList className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No logs found</p>
            <p className="text-xs text-slate-400 mt-1">
              {hasFilters ? 'Try adjusting or clearing the filters.' : 'System activity will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">
                    Action
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">
                    User
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase hidden lg:table-cell">
                    Description
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">
                    IP Address
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-slate-500 uppercase">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {reports.map((log) => (
                  <tr
                    key={log._id}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/20"
                  >
                    <td className="py-3 px-4">
                      <Badge variant={getActionVariant(log.action)} size="sm">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                        {log.userId?.name || 'System'}
                      </p>
                      {log.userId?.email && (
                        <p className="text-[11px] text-slate-400">{log.userId.email}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs hidden lg:table-cell max-w-md">
                      <span className="line-clamp-2">{log.description}</span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400 hidden md:table-cell whitespace-nowrap">
                      {log.ipAddress || 'Unknown'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {formatRelativeTime(log.createdAt)}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {formatDate(log.createdAt, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500">
              Page {meta.page} of {meta.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={FaChevronLeft}
                isDisabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={FaChevronRight}
                iconPosition="right"
                isDisabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default AdminActivityPage;
