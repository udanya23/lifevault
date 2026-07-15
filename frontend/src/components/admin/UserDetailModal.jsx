/**
 * components/admin/UserDetailModal.jsx — Admin user drill-down
 *
 * Shows account info, vault usage stats, and recent activity for a
 * single user, with suspend/unsuspend and delete actions.
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FaUser,
  FaFileAlt,
  FaQrcode,
  FaStream,
  FaPhoneAlt,
  FaBan,
  FaCheckCircle,
  FaTrash,
  FaSpinner,
} from 'react-icons/fa';

import {
  fetchUserDetail,
  clearUserDetail,
  selectAdminUserDetail,
  selectAdminUserDetailLoading,
} from '@/features/admin/adminSlice';
import { formatDate, formatRelativeTime } from '@/utils/helpers';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';

const StatTile = ({ icon: Icon, label, value, colorClass }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
    </div>
    <div className="min-w-0">
      <p className="text-lg font-extrabold text-slate-900 dark:text-white leading-none tabular-nums">
        {value}
      </p>
      <p className="text-[10px] font-semibold text-slate-500 mt-1 truncate">{label}</p>
    </div>
  </div>
);

const UserDetailModal = ({ userId, isOpen, onClose, onSuspendToggle, onDelete, actionLoading }) => {
  const dispatch = useDispatch();
  const detail = useSelector(selectAdminUserDetail);
  const isLoading = useSelector(selectAdminUserDetailLoading);

  useEffect(() => {
    if (isOpen && userId) {
      dispatch(fetchUserDetail(userId));
    }
    return () => {
      if (!isOpen) dispatch(clearUserDetail());
    };
  }, [isOpen, userId, dispatch]);

  const user = detail?.user;
  const stats = detail?.stats;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Details"
      subtitle="Account overview, vault usage, and recent activity"
      icon={FaUser}
      size="lg"
      footer={
        user && (
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button
              variant={user.isSuspended ? 'success' : 'outline'}
              size="sm"
              icon={user.isSuspended ? FaCheckCircle : FaBan}
              isLoading={actionLoading}
              onClick={() => onSuspendToggle(user)}
            >
              {user.isSuspended ? 'Unsuspend Account' : 'Suspend Account'}
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={FaTrash}
              onClick={() => onDelete(user)}
            >
              Delete User
            </Button>
          </div>
        )
      }
    >
      {isLoading || !detail ? (
        <div className="flex items-center justify-center py-16">
          <FaSpinner className="h-7 w-7 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Identity */}
          <div className="flex items-center gap-4">
            <Avatar src={user.profilePhoto?.url} name={user.name} size="lg" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                  {user.name}
                </h4>
                {user.isSuspended ? (
                  <Badge variant="danger" size="sm">Suspended</Badge>
                ) : user.isEmailVerified ? (
                  <Badge variant="success" size="sm">Verified</Badge>
                ) : (
                  <Badge variant="warning" size="sm">Unverified</Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Joined {formatDate(user.createdAt, { month: 'long', day: 'numeric', year: 'numeric' })}
                {detail.lastActivity &&
                  ` · Last active ${formatRelativeTime(detail.lastActivity.createdAt)}`}
              </p>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatTile
              icon={FaFileAlt}
              label="Documents"
              value={stats.documentsCount}
              colorClass="bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400"
            />
            <StatTile
              icon={FaQrcode}
              label="QR Scans"
              value={stats.scansCount}
              colorClass="bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400"
            />
            <StatTile
              icon={FaStream}
              label="Timeline Events"
              value={stats.timelineCount}
              colorClass="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            />
            <StatTile
              icon={FaPhoneAlt}
              label="Emergency Contacts"
              value={stats.contactsCount}
              colorClass="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
            />
          </div>

          {/* Recent Activity */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2.5">
              Recent Activity
            </h5>
            {detail.recentLogs?.length > 0 ? (
              <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {detail.recentLogs.map((log) => (
                  <li
                    key={log._id}
                    className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {log.action}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{log.description}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0 mt-0.5">
                      {formatRelativeTime(log.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No activity recorded</p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default UserDetailModal;
