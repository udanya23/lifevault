/**
 * App.jsx — Root Application Component
 *
 * Responsibilities:
 * 1. Dark mode: reads isDarkMode from Redux, applies/removes 'dark' class on <html>
 * 2. Session initialization: on mount, attempts a silent token refresh to restore
 *    the session if the user previously logged in (uses httpOnly refresh cookie)
 * 3. Route configuration: defines all application routes
 * 4. App-wide loading state: shows a full-page spinner while the session
 *    refresh is in progress (prevents flash of login page for valid sessions)
 */

import { useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { refreshAccessToken } from '@/features/auth/authSlice';
import {
  selectIsInitialized,
  selectIsAuthenticated,
  selectUserRole,
} from '@/features/auth/authSlice';
import { selectIsDarkMode } from '@/features/ui/uiSlice';
import { ROUTES } from '@/utils/constants';

// ── Auth Pages ────────────────────────────────────────────────────────────────
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';
import LandingPage from '@/pages/LandingPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import ProfilePage from '@/pages/profile/ProfilePage';
import DocumentsPage from '@/pages/documents/DocumentsPage';
import QRCodePage from '@/pages/qr/QRCodePage';
import EmergencyPage from '@/pages/emergency/EmergencyPage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import ActivityLogPage from '@/pages/activity/ActivityLogPage';
import SettingsPage from '@/pages/settings/SettingsPage';
import UnauthorizedPage from '@/pages/UnauthorizedPage';
import NotFoundPage from '@/pages/NotFoundPage';

// ── Route Guards & Layouts ──────────────────────────────────────────────────
import ProtectedRoute from '@/components/common/ProtectedRoute';
import GuestRoute from '@/components/common/GuestRoute';
import AppLayout from '@/components/layout/AppLayout';

// ── Page Placeholders (lazy-loaded in subsequent modules) ─────────────────────
const ComingSoon = ({ name }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif',
      background: 'var(--color-bg)',
      color: 'var(--color-text)',
      gap: '16px',
    }}
  >
    <div
      style={{
        fontSize: '48px',
        background: 'linear-gradient(135deg, #2563EB, #818cf8)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontFamily: 'Poppins, sans-serif',
        fontWeight: 800,
      }}
    >
      🔐 LifeVault
    </div>
    <p style={{ color: 'var(--color-text-secondary)', fontSize: '18px' }}>
      Module loading: <strong>{name}</strong>
    </p>
    <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
      Building module by module. Next: Landing Page & Shared Layout
    </p>
  </div>
);

// ── Full-Page Spinner ─────────────────────────────────────────────────────────
const AppLoader = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--color-bg)',
    }}
  >
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: '48px',
          height: '48px',
          border: '3px solid var(--color-border)',
          borderTopColor: '#2563EB',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p
        style={{
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 700,
          fontSize: '20px',
          color: '#2563EB',
        }}
      >
        LifeVault
      </p>
      <p
        style={{
          color: 'var(--color-text-muted)',
          fontSize: '13px',
          marginTop: '4px',
        }}
      >
        Securing your vault...
      </p>
    </div>
  </div>
);

// ── App Component ─────────────────────────────────────────────────────────────

function App() {
  const dispatch = useDispatch();
  const isDarkMode = useSelector(selectIsDarkMode);
  const isInitialized = useSelector(selectIsInitialized);
  const hasAttemptedRefresh = useRef(false);

  // ── Dark Mode Effect ────────────────────────────────────────────────────────
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
      html.style.colorScheme = 'dark';
    } else {
      html.classList.remove('dark');
      html.style.colorScheme = 'light';
    }
  }, [isDarkMode]);

  // ── Session Initialization ──────────────────────────────────────────────────
  useEffect(() => {
    // Prevent duplicate refresh calls in React.StrictMode (dev-only double mount).
    if (hasAttemptedRefresh.current) return;
    hasAttemptedRefresh.current = true;
    dispatch(refreshAccessToken());
  }, [dispatch]);

  // ── Loading State ───────────────────────────────────────────────────────────
  if (!isInitialized) {
    return <AppLoader />;
  }

  // ── Route Configuration ─────────────────────────────────────────────────────
  return (
    <Routes>
      {/* Public Pages */}
      <Route path={ROUTES.HOME} element={<LandingPage />} />
      <Route path="/emergency/:qrToken" element={<EmergencyPage />} />

      {/* Guest Only Routes (Restricted when logged in) */}
      <Route element={<GuestRoute />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
        <Route path={`${ROUTES.RESET_PASSWORD}/:token`} element={<ResetPasswordPage />} />
      </Route>

      <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />

      {/* Email Verification Link (Open context) */}
      <Route path={`${ROUTES.VERIFY_EMAIL}/:token`} element={<VerifyEmailPage />} />

      {/* Protected User Routes (User and Admin accessible) */}
      <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          <Route path={ROUTES.DOCUMENTS} element={<DocumentsPage />} />
          <Route path={ROUTES.QR_CODE} element={<QRCodePage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          <Route path={ROUTES.ACTIVITY} element={<ActivityLogPage />} />
        </Route>
      </Route>

      {/* Protected Admin Only Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.ADMIN} element={<AdminDashboardPage />} />
          <Route path={ROUTES.ADMIN_USERS} element={<AdminUsersPage />} />
        </Route>
      </Route>

      {/* Fallback Redirect */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
export default App;
