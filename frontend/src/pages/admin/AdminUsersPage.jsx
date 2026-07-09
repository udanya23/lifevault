/**
 * pages/admin/AdminUsersPage.jsx — User Management
 *
 * Search, filter, suspend, and delete platform users.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  FaSearch,
  FaSpinner,
  FaBan,
  FaCheckCircle,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
  FaArrowLeft,
} from 'react-icons/fa';

import {
  fetchUsers,
  updateUserStatus,
  deleteUser,
  selectAdminUsers,
  selectAdminUsersMeta,
  selectAdminUsersLoading,
} from '@/features/admin/adminSlice';
import { ROUTES } from '@/utils/constants';
import { formatDate } from '@/utils/helpers';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Modal from '@/components/common/Modal';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Users' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'unverified', label: 'Unverified Email' },
];

const AdminUsersPage = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectAdminUsers);
  const meta = useSelector(selectAdminUsersMeta);
  const isLoading = useSelector(selectAdminUsersLoading);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    dispatch(fetchUsers({ page, limit: 10, search: search.trim(), status }));
  }, [dispatch, page, search, status]);

  const handleSearchChange = (e) => setSearchInput(e.target.value);

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const handleSuspendToggle = async (user) => {
    setActionLoading(user._id);
    try {
      await dispatch(
        updateUserStatus({
          id: user._id,
          isSuspended: !user.isSuspended,
        })
      ).unwrap();
      toast.success(
        user.isSuspended ? 'User unsuspended successfully.' : 'User suspended successfully.'
      );
    } catch (err) {
      toast.error(err?.message || 'Failed to update user status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(deleteTarget._id);
    try {
      await dispatch(deleteUser(deleteTarget._id)).unwrap();
      toast.success('User permanently deleted.');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.message || 'Failed to delete user.');
    } finally {
      setActionLoading(null);
    }
  };

  const getUserStatusBadge = (user) => {
    if (user.isSuspended) return <Badge variant="danger">Suspended</Badge>;
    if (!user.isActive) return <Badge variant="warning">Inactive</Badge>;
    if (!user.isEmailVerified) return <Badge variant="warning">Unverified</Badge>;
    return <Badge variant="success">Active</Badge>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 text-left"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            to={ROUTES.ADMIN}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-2"
          >
            <FaArrowLeft className="h-3 w-3" /> Back to Admin Dashboard
          </Link>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
            User Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {meta.total} user{meta.total !== 1 ? 's' : ''} registered
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={handleSearchChange}
              icon={FaSearch}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              options={STATUS_OPTIONS}
              value={status}
              onChange={handleStatusChange}
              placeholder="Filter status"
            />
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card padding="none" className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <FaSpinner className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-sm text-slate-500 py-16 text-center">No users found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">
                    User
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">
                    Joined
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-slate-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/20"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={user.profilePhoto?.url}
                          name={user.name}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs hidden md:table-cell">
                      {formatDate(user.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4">{getUserStatusBadge(user)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant={user.isSuspended ? 'success' : 'outline'}
                          size="sm"
                          icon={user.isSuspended ? FaCheckCircle : FaBan}
                          isLoading={actionLoading === user._id}
                          onClick={() => handleSuspendToggle(user)}
                        >
                          {user.isSuspended ? 'Unsuspend' : 'Suspend'}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          icon={FaTrash}
                          onClick={() => setDeleteTarget(user)}
                        >
                          Delete
                        </Button>
                      </div>
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

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete User Permanently"
        size="sm"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
          This will permanently delete{' '}
          <strong>{deleteTarget?.name}</strong> ({deleteTarget?.email}) and all their
          vault data including documents, profile, and medical info.
        </p>
        <p className="text-xs text-red-600 font-semibold mb-6">
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            fullWidth
            icon={FaTrash}
            isLoading={actionLoading === deleteTarget?._id}
            onClick={handleDelete}
          >
            Delete User
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
};

export default AdminUsersPage;
