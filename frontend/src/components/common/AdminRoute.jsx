/**
 * components/common/AdminRoute.jsx — Admin-only route guard
 */

import ProtectedRoute from './ProtectedRoute';

const AdminRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['admin']}>{children}</ProtectedRoute>
);

export default AdminRoute;
