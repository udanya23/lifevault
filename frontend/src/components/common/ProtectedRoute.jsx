/**
 * components/common/ProtectedRoute.jsx — Route Guard for Authenticated Users
 *
 * Checks Redux state to verify if the user is authenticated.
 * Features:
 * - Shows loading state while checking token
 * - Redirects to login page if unauthenticated, saving the location the user
 *   was trying to access to redirect them back after successful login
 * - Supports role-based access checks (e.g. restricts pages to admins)
 */

import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  selectIsAuthenticated,
  selectIsInitialized,
  selectUserRole,
} from '@/features/auth/authSlice';
import { ROUTES } from '@/utils/constants';

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInitialized = useSelector(selectIsInitialized);
  const userRole = useSelector(selectUserRole);

  // While app is validating token on load, show nothing (or page level spinner)
  // to avoid flashing content or redirecting incorrectly
  if (!isInitialized) {
    return null;
  }

  // If not logged in, redirect to login page, preserving path they wanted
  if (!isAuthenticated) {
    return (
      <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
    );
  }

  // Check if role is authorized (if role requirements are defined)
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  // Render children or nested react-router outlets
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
