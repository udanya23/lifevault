/**
 * pages/UnauthorizedPage.jsx — 403 access denied
 */

import { Link } from 'react-router-dom';
import { FaShieldAlt } from 'react-icons/fa';
import Button from '@/components/common/Button';
import { ROUTES } from '@/utils/constants';

const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
    <div className="text-center max-w-md">
      <FaShieldAlt className="w-16 h-16 text-amber-500 mx-auto mb-6" />
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h1>
      <p className="text-slate-500 mb-8">You don't have permission to view this page.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to={ROUTES.DASHBOARD}><Button variant="primary">Go to Dashboard</Button></Link>
        <Link to={ROUTES.LOGIN}><Button variant="outline">Sign In</Button></Link>
      </div>
    </div>
  </div>
);

export default UnauthorizedPage;
