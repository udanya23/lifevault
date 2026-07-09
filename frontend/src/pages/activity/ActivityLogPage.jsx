/**
 * pages/activity/ActivityLogPage.jsx — Activity Logs Page
 *
 * Premium:
 * - Rounded capsule pill selectors with smooth sliding tabs
 * - Timeline elements featuring left margin indicator stripes
 * - Enhanced pagination widgets using icon buttons and flex rows
 */

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHistory,
  FaQrcode,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaNetworkWired,
  FaDesktop,
  FaMapMarkerAlt,
  FaSignInAlt,
  FaSignOutAlt,
  FaFileAlt,
  FaUserEdit,
  FaHeartbeat,
  FaPhone,
  FaShieldAlt,
} from 'react-icons/fa';

import {
  fetchActivityLogs,
  fetchQRScans,
  selectActivityLogs,
  selectActivityLogsMeta,
  selectQRScans,
  selectQRScansMeta,
  selectActivityLogsLoading,
  selectQRScansLoading,
} from '@/features/activity/activitySlice';
import { formatDate, formatRelativeTime, truncate } from '@/utils/helpers';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';

const TABS = [
  { id: 'logs', label: 'Security Logs', icon: FaHistory },
  { id: 'scans', label: 'QR Scans', icon: FaQrcode },
];

const getActionIcon = (action = '') => {
  const lower = action.toLowerCase();
  if (lower.includes('login')) return FaSignInAlt;
  if (lower.includes('logout')) return FaSignOutAlt;
  if (lower.includes('document')) return FaFileAlt;
  if (lower.includes('profile') || lower.includes('photo')) return FaUserEdit;
  if (lower.includes('medical')) return FaHeartbeat;
  if (lower.includes('contact')) return FaPhone;
  if (lower.includes('qr')) return FaQrcode;
  return FaShieldAlt;
};

const getActionBadgeVariant = (action = '') => {
  const lower = action.toLowerCase();
  if (lower.includes('login') || lower.includes('verified')) return 'success';
  if (lower.includes('delete') || lower.includes('logout')) return 'danger';
  if (lower.includes('upload') || lower.includes('update') || lower.includes('add')) return 'info';
  return 'default';
};

const Pagination = ({ meta, page, onPageChange }) => {
  if (meta.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
        {meta.total} record{meta.total !== 1 ? 's' : ''} · Page {meta.page} of {meta.totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="xs"
          icon={FaChevronLeft}
          isDisabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Prev
        </Button>
        <Button
          variant="outline"
          size="xs"
          icon={FaChevronRight}
          iconPosition="right"
          isDisabled={page >= meta.totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

const ActivityLogPage = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('logs');
  const [logsPage, setLogsPage] = useState(1);
  const [scansPage, setScansPage] = useState(1);

  const logs = useSelector(selectActivityLogs);
  const logsMeta = useSelector(selectActivityLogsMeta);
  const scans = useSelector(selectQRScans);
  const scansMeta = useSelector(selectQRScansMeta);
  const isLoadingLogs = useSelector(selectActivityLogsLoading);
  const isLoadingScans = useSelector(selectQRScansLoading);

  useEffect(() => {
    if (activeTab === 'logs') {
      dispatch(fetchActivityLogs({ page: logsPage, limit: 15 }));
    }
  }, [dispatch, activeTab, logsPage]);

  useEffect(() => {
    if (activeTab === 'scans') {
      dispatch(fetchQRScans({ page: scansPage, limit: 15 }));
    }
  }, [dispatch, activeTab, scansPage]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const isLoading = activeTab === 'logs' ? isLoadingLogs : isLoadingScans;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 text-left"
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
            Activity Logs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor security events and emergency QR code access history.
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-fit border border-slate-200/20">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer outline-none
                ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }
              `}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              {tab.id === 'logs' && logsMeta.total > 0 && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-0.5 ${isActive ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                  {logsMeta.total}
                </span>
              )}
              {tab.id === 'scans' && scansMeta.total > 0 && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-0.5 ${isActive ? 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                  {scansMeta.total}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content Card */}
      <Card variant="default" padding="none" className="overflow-hidden border-slate-205 dark:border-slate-700/80">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <FaSpinner className="h-8 w-8 text-blue-600 animate-spin" aria-hidden="true" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'logs' ? (
              <motion.div
                key="logs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {logs.length === 0 ? (
                  <div className="py-16 text-center px-4 flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                      <FaHistory className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        No security events yet
                      </p>
                      <p className="text-xs text-slate-455 dark:text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                        Sensitive actions like profile updates, logins, and settings revisions will be logged here.
                      </p>
                    </div>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {logs.map((log) => {
                      const ActionIcon = getActionIcon(log.action);
                      return (
                        <li
                          key={log._id}
                          className="flex items-start gap-4 p-4.5 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors"
                        >
                          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/25 text-blue-600 dark:text-blue-400 shrink-0">
                            <ActionIcon className="h-4.5 w-4.5" aria-hidden="true" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <Badge variant={getActionBadgeVariant(log.action)} size="sm">
                                {log.action}
                              </Badge>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                                {formatRelativeTime(log.createdAt)}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-normal">
                              {log.description}
                            </p>
                            <div className="flex flex-wrap gap-3.5 mt-2.5 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                              <span className="flex items-center gap-1">
                                <FaNetworkWired className="h-3 w-3 text-slate-350" aria-hidden="true" />
                                IP: {log.ipAddress}
                              </span>
                              <span className="flex items-center gap-1 max-w-xs truncate">
                                <FaDesktop className="h-3 w-3 text-slate-350 shrink-0" aria-hidden="true" />
                                {truncate(log.userAgent, 55)}
                              </span>
                              <span className="text-slate-350 dark:text-slate-600">
                                {formatDate(log.createdAt, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <Pagination
                  meta={logsMeta}
                  page={logsPage}
                  onPageChange={setLogsPage}
                />
              </motion.div>
            ) : (
              <motion.div
                key="scans"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {scans.length === 0 ? (
                  <div className="py-16 text-center px-4 flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                      <FaQrcode className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        No QR scans detected
                      </p>
                      <p className="text-xs text-slate-455 dark:text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                        When responders scan your unique emergency card QR code, the event records will render here immediately.
                      </p>
                    </div>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {scans.map((scan) => (
                      <li
                        key={scan._id}
                        className="flex items-start gap-4 p-4.5 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors"
                      >
                        <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/25 text-red-650 dark:text-red-400 shrink-0">
                          <FaQrcode className="h-4.5 w-4.5" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <Badge variant="danger" size="sm" className="font-extrabold uppercase text-[9px]">
                              Emergency Scan
                            </Badge>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                              {formatRelativeTime(scan.scannedAt)}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-205 leading-normal">
                            Emergency medical profile was accessed via QR code scan.
                          </p>
                          <div className="flex flex-wrap gap-3.5 mt-2.5 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                            <span className="flex items-center gap-1">
                              <FaNetworkWired className="h-3 w-3 text-slate-350" aria-hidden="true" />
                              IP: {scan.scannerIp}
                            </span>
                            <span className="flex items-center gap-1 max-w-xs truncate">
                              <FaMapMarkerAlt className="h-3 w-3 text-slate-350 shrink-0" aria-hidden="true" />
                              {scan.scannerArea || 'Unknown'}
                            </span>
                            <span className="flex items-center gap-1 max-w-xs truncate">
                              <FaDesktop className="h-3 w-3 text-slate-350 shrink-0" aria-hidden="true" />
                              {truncate(scan.userAgent, 55)}
                            </span>
                            <span className="text-slate-350 dark:text-slate-600">
                              {formatDate(scan.scannedAt, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <Pagination
                  meta={scansMeta}
                  page={scansPage}
                  onPageChange={setScansPage}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </Card>
    </motion.div>
  );
};

export default ActivityLogPage;
