/**
 * components/common/GuestRoute.jsx — Route Guard for Guests Only
 *
 * Prevents logged-in users from accessing visitor-only pages like Login,
 * Register, Forgot Password, and Reset Password.
 * Redirects authenticated users directly to their dashboard.
 */

import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectIsInitialized } from '@/features/auth/authSlice';
import { ROUTES } from '@/utils/constants';

const GuestRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInitialized = useSelector(selectIsInitialized);

  if (!isInitialized) {
    return null;
  }

  // If user is already authenticated, redirect them to dashboard
  if (isAuthenticated) {
    // Check if redirect-back path is saved in router history state (e.g. from ProtectedRoute)
    const fromPath = location.state?.from?.pathname || ROUTES.DASHBOARD;
    return <Navigate to={fromPath} replace />;
  }

  return children ? children : <Outlet />;
};

export default GuestRoute;
