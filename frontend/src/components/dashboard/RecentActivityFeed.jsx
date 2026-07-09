/**
 * components/dashboard/RecentActivityFeed.jsx — Telemetry Activity Feed
 *
 * Premium: timeline dot connectors, red alert badge on QR scans,
 * gradient card accent stripe, hover transitions.
 */

import { Link } from 'react-router-dom';
import {
  FaQrcode, FaHistory, FaClock, FaDesktop,
  FaNetworkWired, FaArrowRight, FaCircle,
} from 'react-icons/fa';
import { ROUTES } from '@/utils/constants';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = ({ icon, title, desc }) => (
  <div className="py-10 text-center border-2 border-dashed border-slate-100 dark:border-slate-700/60 rounded-2xl flex flex-col items-center gap-2">
    <span className="text-3xl" aria-hidden="true">{icon}</span>
    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{title}</p>
    <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-[220px] leading-relaxed">{desc}</p>
  </div>
);

// ── View All Link ─────────────────────────────────────────────────────────────
const ViewAllLink = ({ label }) => (
  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex justify-end">
    <Link
      to={ROUTES.ACTIVITY}
      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group"
    >
      {label}
      <FaArrowRight className="h-2.5 w-2.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
    </Link>
  </div>
);

// ── Panel Wrapper ─────────────────────────────────────────────────────────────
const Panel = ({ children, accent = 'blue' }) => {
  const accents = {
    red:  'from-red-500 to-rose-500',
    blue: 'from-blue-500 to-indigo-500',
  };
  return (
    <div className="relative bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm p-6 flex flex-col justify-between overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${accents[accent]} rounded-t-2xl`} aria-hidden="true" />
      {children}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const RecentActivityFeed = ({ scans = [], logs = [] }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">

    {/* ── QR Scans Pane ── */}
    <Panel accent="red">
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <FaQrcode className="h-3.5 w-3.5 text-red-500" aria-hidden="true" />
            Emergency QR Scans
          </h3>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
            Live Monitor
          </span>
        </div>

        {scans.length === 0 ? (
          <EmptyState
            icon="👁️"
            title="No scans detected yet"
            desc="Responders scanning your QR code will generate records here instantly."
          />
        ) : (
          <div className="space-y-3">
            {scans.map((scan, i) => (
              <div
                key={scan._id || i}
                className="p-3.5 rounded-xl bg-red-50/40 dark:bg-red-950/10 border border-red-100/60 dark:border-red-900/20 space-y-2 text-xs"
              >
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                    🚨 Code Scanned
                  </span>
                  <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                    <FaClock className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
                    {formatDate(scan.scannedAt)}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between gap-2 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <FaNetworkWired className="h-3 w-3 text-slate-400 shrink-0" aria-hidden="true" />
                    <span className="font-medium truncate max-w-[160px]">IP: {scan.scannerIp}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <FaDesktop className="h-3 w-3 shrink-0" aria-hidden="true" />
                    <span className="truncate max-w-[180px]">{scan.userAgent}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {scans.length > 0 && <ViewAllLink label="View Full Scan History" />}
    </Panel>

    {/* ── Audit Logs Pane ── */}
    <Panel accent="blue">
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <FaHistory className="h-3.5 w-3.5 text-blue-500" aria-hidden="true" />
            Security Audit Logs
          </h3>
        </div>

        {logs.length === 0 ? (
          <EmptyState
            icon="🛡️"
            title="No activity logged"
            desc="Logins, profile updates, and sensitive actions will appear here for auditing."
          />
        ) : (
          <div className="space-y-0 divide-y divide-slate-100 dark:divide-slate-700/50">
            {logs.map((log, i) => (
              <div
                key={log._id || i}
                className="flex items-start gap-3 py-3 group"
              >
                {/* Timeline dot */}
                <div className="flex flex-col items-center shrink-0 mt-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 group-hover:bg-blue-600 transition-colors" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                      {log.action}
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 tabular-nums">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                  {log.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {log.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {logs.length > 0 && <ViewAllLink label="View Full Logs" />}
    </Panel>
  </div>
);

export default RecentActivityFeed;
