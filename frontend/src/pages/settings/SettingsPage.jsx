/**
 * pages/settings/SettingsPage.jsx — Account Settings
 *
 * Premium:
 * - Structured Card sub-elements with top accent line colors
 * - Clean danger zone box styling with thick red border and warning badge
 * - Polished switch button with smooth animation
 * - Modal headers, icons, and footer integrations
 */

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaMoon,
  FaSun,
  FaTrash,
  FaShieldAlt,
  FaExclamationTriangle,
} from 'react-icons/fa';

import {
  selectCurrentUser,
  updateUser,
  clearCredentials,
} from '@/features/auth/authSlice';
import { selectIsDarkMode, setDarkMode } from '@/features/ui/uiSlice';
import { settingsAPI } from '@/api/settingsAPI';
import { authAPI } from '@/api/authAPI';
import { ROUTES } from '@/utils/constants';
import { formatDate } from '@/utils/helpers';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import Avatar from '@/components/common/Avatar';

const nameSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required('Name is required')
    .max(50, 'Name cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s.-]+$/, 'Name can only contain letters, spaces, hyphens, and dots'),
});

const passwordSchema = yup.object().shape({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/,
      'Must contain uppercase, lowercase, number, and special character'
    ),
  confirmPassword: yup
    .string()
    .required('Please confirm your new password')
    .oneOf([yup.ref('newPassword')], 'Passwords do not match'),
});

const deleteSchema = yup.object().shape({
  password: yup.string().required('Password is required to confirm deletion'),
});

const SettingsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser) || {};
  const isDarkMode = useSelector(selectIsDarkMode);

  const [savingName, setSavingName] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [memberSince, setMemberSince] = useState(null);

  useEffect(() => {
    settingsAPI
      .getAccount()
      .then((res) => {
        if (res.data?.data?.createdAt) {
          setMemberSince(res.data.data.createdAt);
        }
      })
      .catch(() => {});
  }, []);

  const nameForm = useForm({
    resolver: yupResolver(nameSchema),
    defaultValues: { name: user.name || '' },
    values: { name: user.name || '' },
  });

  const passwordForm = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const deleteForm = useForm({
    resolver: yupResolver(deleteSchema),
    defaultValues: { password: '' },
  });

  const onUpdateName = async (data) => {
    setSavingName(true);
    try {
      const response = await settingsAPI.updateAccount(data);
      dispatch(updateUser({ name: response.data.data.name }));
      toast.success('Display name updated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update name.');
    } finally {
      setSavingName(false);
    }
  };

  const onChangePassword = async (data) => {
    setChangingPassword(true);
    try {
      await settingsAPI.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      toast.success('Password changed. Please sign in again.');
      dispatch(clearCredentials());
      navigate(ROUTES.LOGIN);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleResendVerification = async () => {
    setResendingEmail(true);
    try {
      await authAPI.resendVerification({ email: user.email });
      toast.success('Verification email sent. Check your inbox.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend verification email.');
    } finally {
      setResendingEmail(false);
    }
  };

  const onDeleteAccount = async (data) => {
    setDeleting(true);
    try {
      await settingsAPI.deleteAccount({ password: data.password });
      toast.success('Your account has been permanently deleted.');
      dispatch(clearCredentials());
      navigate(ROUTES.HOME);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 text-left"
    >
      <div>
        <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
          Account Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your account, security credentials, and app preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* ── Left column: account & security forms ── */}
        <div className="lg:col-span-3 space-y-6">
          {/* Account Information */}
          <Card variant="default" accent className="border-slate-200 dark:border-slate-700/80">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4 select-none">
              <FaUser className="text-blue-500" aria-hidden="true" /> Account Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5 select-none">
                  Email Address
                </label>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <FaEnvelope className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.email}</span>
                  {user.isEmailVerified ? (
                    <Badge variant="success" size="sm" dot>Verified</Badge>
                  ) : (
                    <Badge variant="warning" size="sm" dot>Unverified</Badge>
                  )}
                </div>
              </div>

              {!user.isEmailVerified && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 flex items-start gap-3">
                  <FaExclamationTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                      Please verify your email address to secure your account.
                    </p>
                    <Button
                      variant="outline"
                      size="xs"
                      className="mt-2.5"
                      isLoading={resendingEmail}
                      onClick={handleResendVerification}
                    >
                      Resend Verification Email
                    </Button>
                  </div>
                </div>
              )}

              <form onSubmit={nameForm.handleSubmit(onUpdateName)} className="space-y-3 pt-1">
                <Input
                  label="Display Name"
                  icon={FaUser}
                  error={nameForm.formState.errors.name?.message}
                  required
                  {...nameForm.register('name')}
                />
                <Button type="submit" size="sm" isLoading={savingName}>
                  Save Name
                </Button>
              </form>
            </div>
          </Card>

          {/* Change Password */}
          <Card variant="default" className="border-slate-200 dark:border-slate-700/80">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4 select-none">
              <FaLock className="text-emerald-500" aria-hidden="true" /> Change Password
            </h3>
            <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                icon={FaLock}
                error={passwordForm.formState.errors.currentPassword?.message}
                required
                {...passwordForm.register('currentPassword')}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  type="password"
                  icon={FaLock}
                  error={passwordForm.formState.errors.newPassword?.message}
                  required
                  {...passwordForm.register('newPassword')}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  icon={FaLock}
                  error={passwordForm.formState.errors.confirmPassword?.message}
                  required
                  {...passwordForm.register('confirmPassword')}
                />
              </div>
              <Button type="submit" size="sm" isLoading={changingPassword} icon={FaShieldAlt}>
                Update Password
              </Button>
            </form>
          </Card>
        </div>

        {/* ── Right column: profile summary, appearance, danger zone ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Summary */}
          <Card variant="default" className="border-slate-200 dark:border-slate-700/80 overflow-hidden">
            <div
              className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-blue-600 to-indigo-600"
              aria-hidden="true"
            />
            <div className="relative pt-6 flex flex-col items-center text-center">
              <Avatar
                src={user.profilePhoto?.url}
                name={user.name}
                size="xl"
                ring
                className="shadow-lg"
              />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-3">
                {user.name}
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-full">{user.email}</p>
              <div className="flex items-center gap-2 mt-2.5 flex-wrap justify-center">
                {user.role === 'admin' ? (
                  <Badge variant="purple" size="sm" icon={FaShieldAlt}>Administrator</Badge>
                ) : (
                  <Badge variant="primary" size="sm">Personal Account</Badge>
                )}
                {user.isEmailVerified && <Badge variant="success" size="sm" dot>Verified</Badge>}
              </div>
              {memberSince && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 font-semibold">
                  Member since {formatDate(memberSince, { month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          </Card>

          {/* Appearance */}
          <Card variant="default" className="border-slate-200 dark:border-slate-700/80">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4 select-none">
              {isDarkMode ? (
                <FaMoon className="text-indigo-500" aria-hidden="true" />
              ) : (
                <FaSun className="text-amber-500" aria-hidden="true" />
              )}
              Appearance
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Dark Mode
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Switch between light and dark visual themes.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isDarkMode}
                onClick={() => dispatch(setDarkMode(!isDarkMode))}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-250 cursor-pointer outline-none
                  ${isDarkMode ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200
                    ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card variant="default" className="border-red-200/80 dark:border-red-950/40 bg-red-50/10 dark:bg-red-950/5">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-red-500 rounded-t-2xl" aria-hidden="true" />
            <h3 className="text-sm font-bold text-red-650 dark:text-red-400 flex items-center gap-2 mb-2 select-none">
              <FaTrash aria-hidden="true" /> Danger Zone
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed font-semibold">
              Permanently delete your account and all secure documents, medical records, and contacts. This operation cannot be undone.
            </p>
            <Button variant="danger" size="sm" icon={FaTrash} onClick={() => setShowDeleteModal(true)}>
              Delete My Account
            </Button>
          </Card>
        </div>
      </div>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          deleteForm.reset();
        }}
        title="Delete Account Permanently"
        subtitle="This action will delete all vault files and emergency details immediately."
        icon={FaTrash}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                deleteForm.reset();
              }}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              onClick={deleteForm.handleSubmit(onDeleteAccount)}
              variant="danger"
              isLoading={deleting}
              size="sm"
            >
              Delete Forever
            </Button>
          </div>
        }
      >
        <div className="space-y-4 pt-1">
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/30 text-red-750 dark:text-red-400 text-xs font-semibold leading-relaxed">
            All details, document uploads, registered next-of-kin, and your emergency QR link mapping will be lost forever.
          </div>

          <Input
            label="Confirm Password"
            type="password"
            icon={FaLock}
            placeholder="Enter password to confirm"
            error={deleteForm.formState.errors.password?.message}
            required
            {...deleteForm.register('password')}
          />
        </div>
      </Modal>
    </motion.div>
  );
};

export default SettingsPage;
