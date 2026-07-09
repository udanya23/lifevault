/**
 * pages/auth/VerifyEmailPage.jsx — Email Verification Status Page
 *
 * Implements:
 * - Silent verification request on mount
 * - Three-state flow: loading, success, or error
 * - Inline resend form in case the link is expired or invalid
 * - Springy motion animations
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaEnvelope,
  FaSpinner,
} from 'react-icons/fa';

import { authAPI } from '@/api/authAPI';
import { ROUTES } from '@/utils/constants';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

const schema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .required('Email address is required')
    .email('Please enter a valid email address'),
});

const VerifyEmailPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [resendLoading, setResendLoading] = useState(false);
  const verifyAttempted = useRef(false); // Prevents duplicate calls in React 18+ strict double-render

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    // React 18+ double mount in strictMode could trigger verify twice,
    // which would make the second request throw a 400 since token is consumed.
    // We guard with a ref check.
    if (verifyAttempted.current) return;
    verifyAttempted.current = true;

    const triggerVerification = async () => {
      try {
        await authAPI.verifyEmail(token);
        setStatus('success');
        toast.success('Your email is verified successfully!');
      } catch (error) {
        setStatus('error');
        toast.error(
          error.response?.data?.message || 'Verification failed. Link may have expired.'
        );
      }
    };

    triggerVerification();
  }, [token]);

  const onResend = async (data) => {
    setResendLoading(true);
    try {
      const response = await authAPI.resendVerification(data);
      toast.success(
        response.data?.message || 'Verification email resent.'
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Resend failed. Please try again.'
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12 transition-colors duration-200">
      <div className="w-full max-w-md">
        {/* Branding Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight">
            <span className="text-blue-600">🔐</span>
            <span className="font-extrabold text-slate-900 dark:text-white">LifeVault</span>
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Your life. One secure vault. Ready in every emergency.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {status === 'loading' && (
            // ── LOADING VIEW ─────────────────────────────────────────────────
            <motion.div
              key="verify-loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card padding="lg" className="text-center border border-slate-200 dark:border-slate-800">
                <div className="mx-auto w-12 h-12 text-blue-600 dark:text-blue-450 animate-spin mb-6 flex items-center justify-center">
                  <FaSpinner className="w-full h-full" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Verifying Your Email
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Please hold on while we register your secure emergency profiles...
                </p>
              </Card>
            </motion.div>
          )}

          {status === 'success' && (
            // ── SUCCESS VIEW ─────────────────────────────────────────────────
            <motion.div
              key="verify-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card padding="lg" className="text-center border border-slate-200 dark:border-slate-800">
                <div className="mx-auto w-16 h-16 text-emerald-500 dark:text-emerald-400 mb-6 animate-bounce">
                  <FaCheckCircle className="w-full h-full" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Verification Complete
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                  Thank you! Your email has been verified. Your secure LifeVault is active and ready to use.
                </p>

                <Link to={ROUTES.LOGIN} className="w-full block">
                  <Button variant="primary" fullWidth>
                    Sign In
                  </Button>
                </Link>
              </Card>
            </motion.div>
          )}

          {status === 'error' && (
            // ── ERROR VIEW (with Resend Trigger) ─────────────────────────────
            <motion.div
              key="verify-error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card padding="lg" className="border border-slate-200 dark:border-slate-800">
                <div className="text-center mb-6">
                  <div className="mx-auto w-16 h-16 text-red-500 dark:text-red-400 mb-4 animate-pulse">
                    <FaTimesCircle className="w-full h-full" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Link Invalid or Expired
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    This verification link has already been used or has expired. Links remain active for 24 hours.
                  </p>
                </div>

                {/* Inline form to resend email */}
                <div className="border-t border-slate-100 dark:border-slate-700/60 pt-6">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                    Resend Verification Link
                  </h3>
                  <form onSubmit={handleSubmit(onResend)} className="space-y-4">
                    <Input
                      label="Your Registered Email"
                      name="email"
                      type="email"
                      icon={FaEnvelope}
                      placeholder="e.g. john@example.com"
                      error={errors.email?.message}
                      {...register('email')}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      variant="outline"
                      isLoading={resendLoading}
                    >
                      Request New Link
                    </Button>
                  </form>
                </div>

                <div className="mt-6 text-center text-xs">
                  <Link to={ROUTES.LOGIN} className="text-blue-600 font-bold hover:underline">
                    Back to Sign In
                  </Link>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
