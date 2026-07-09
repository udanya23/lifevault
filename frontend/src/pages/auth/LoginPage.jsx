/**
 * pages/auth/LoginPage.jsx — Premium Login Page
 *
 * Premium features:
 * - Split-screen layout: animated gradient left panel + clean form right
 * - Glassmorphism card on the form
 * - Framer Motion slide-in entry
 * - Inline error & loading states
 */

import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaShieldAlt, FaChevronRight } from 'react-icons/fa';

import { loginUser, clearAuthError } from '@/features/auth/authSlice';
import { selectAuthLoading, selectAuthError, selectIsAuthenticated } from '@/features/auth/authSlice';
import { ROUTES } from '@/utils/constants';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import HealthcareImage from '@/components/common/HealthcareImage';
import ThemeToggle from '@/components/common/ThemeToggle';
import { HEALTHCARE_IMAGES } from '@/utils/imageAssets';

const schema = yup.object({
  email:      yup.string().trim().required('Email address is required').email('Enter a valid email'),
  password:   yup.string().required('Password is required'),
  rememberMe: yup.boolean().default(false),
});

const LoginPage = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const hasShownSessionExpiredToast = useRef(false);

  const isLoading     = useSelector(selectAuthLoading);
  const authError     = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    dispatch(clearAuthError());
    return () => { dispatch(clearAuthError()); };
  }, [dispatch]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('session') === 'expired' && !hasShownSessionExpiredToast.current) {
      hasShownSessionExpiredToast.current = true;
      toast.warning('Your session has expired. Please log in again.');
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [location, navigate]);

  const onSubmit = async (data) => {
    const result = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back to LifeVault!');
      navigate(from, { replace: true });
    } else if (loginUser.rejected.match(result)) {
      toast.error(result.payload?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row relative">
      <ThemeToggle className="fixed top-4 right-4 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 shadow-sm" />
      {/* ── Left Panel: Photo + bottom text (desktop only) ── */}
      <div className="hidden lg:block lg:w-5/12 xl:w-1/2 relative h-full shrink-0 overflow-hidden">
        <HealthcareImage
          src={HEALTHCARE_IMAGES.login}
          alt="Doctor using secure digital healthcare technology"
          className="absolute inset-0 h-full rounded-none shadow-none"
          rounded="rounded-none"
          hover={false}
          lazy={false}
          placeholderLabel="Add login-doctor.jpg"
        />

        {/* Bottom fade only — keeps the photo visible above */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* Logo — top corner */}
        <div className="absolute top-8 left-8 xl:top-10 xl:left-10 z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-lg">
            <FaShieldAlt className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <span className="font-extrabold text-xl text-white tracking-tight drop-shadow-sm">LifeVault</span>
        </div>

        {/* Copy — anchored to bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute bottom-0 left-0 right-0 z-10 p-8 xl:p-10 text-white"
        >
          <h1 className="text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight drop-shadow-md">
            Your life, one secure vault.
          </h1>
          <p className="text-sm text-white/80 mt-3 leading-relaxed max-w-sm drop-shadow-sm">
            Critical medical info and emergency contacts — instantly available when responders need it.
          </p>
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-white/90">
            {['AES-256 encrypted', 'QR emergency access'].map((point) => (
              <li key={point} className="flex items-center gap-1.5">
                <span className="text-emerald-400" aria-hidden="true">✓</span>
                {point}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-6 py-10 sm:px-10 lg:py-8 lg:min-h-0 lg:overflow-y-auto transition-colors duration-200">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-lg space-y-6"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_2px_12px_rgba(37,99,235,0.35)]">
              <FaShieldAlt className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
            <span className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">
              Life<span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Vault</span>
            </span>
          </div>

          {/* Form Card */}
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] overflow-hidden">
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 to-indigo-500" aria-hidden="true" />

            <div className="p-7 sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Welcome back
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Sign in to manage your emergency vault.
                </p>
              </div>

              {/* Server error */}
              {authError && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-800/30 text-red-700 dark:text-red-400 text-xs font-medium"
                >
                  <svg className="h-4 w-4 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
                  </svg>
                  {authError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  icon={FaEnvelope}
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  autoComplete="email"
                  required
                  {...register('email')}
                />

                <Input
                  label="Password"
                  name="password"
                  type="password"
                  icon={FaLock}
                  placeholder="Enter your password"
                  error={errors.password?.message}
                  autoComplete="current-password"
                  required
                  {...register('password')}
                />

                {/* Remember / Forgot */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 bg-white dark:bg-slate-800 focus:ring-blue-500/30 focus:ring-2 transition-all cursor-pointer"
                      {...register('rememberMe')}
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Remember me</span>
                  </label>

                  <Link
                    to={ROUTES.FORGOT_PASSWORD}
                    className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    isLoading={isLoading}
                    icon={FaChevronRight}
                    iconPosition="right"
                  >
                    Sign In
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link
              to={ROUTES.REGISTER}
              className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Create free account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
