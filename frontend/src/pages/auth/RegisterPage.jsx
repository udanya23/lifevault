/**
 * pages/auth/RegisterPage.jsx — OTP-based 3-step registration
 * Flow: Email → Verify OTP → Account Details → Auto Login → Dashboard
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaShieldAlt, FaChevronRight } from 'react-icons/fa';

import {
  registerUser,
  sendRegistrationOtp,
  verifyRegistrationOtp,
  clearAuthError,
} from '@/features/auth/authSlice';
import { selectAuthLoading, selectAuthError, selectIsAuthenticated } from '@/features/auth/authSlice';
import { ROUTES } from '@/utils/constants';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import OtpInput from '@/components/common/OtpInput';
import PasswordStrengthMeter from '@/components/common/PasswordStrengthMeter';
import HealthcareImage from '@/components/common/HealthcareImage';
import ThemeToggle from '@/components/common/ThemeToggle';
import useOtpTimer from '@/hooks/useOtpTimer';
import { HEALTHCARE_IMAGES } from '@/utils/imageAssets';

const emailSchema = yup.object({
  email: yup.string().trim().required('Email is required').email('Enter a valid email'),
});

const detailsSchema = yup.object({
  name: yup.string().trim().required('Name is required').max(50),
  password: yup.string().required('Password is required').min(8)
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/, 'Must include upper, lower, number & symbol'),
  confirmPassword: yup.string().required('Confirm password').oneOf([yup.ref('password')], 'Passwords do not match'),
  acceptTerms: yup.boolean().oneOf([true], 'Accept terms to continue'),
});

const STEPS = { EMAIL: 1, OTP: 2, DETAILS: 3 };

const STEP_LABELS = ['Email', 'Verify', 'Account'];

const StepProgress = ({ currentStep }) => (
  <div className="flex items-center gap-2 mb-6" aria-label={`Step ${currentStep} of 3`}>
    {STEP_LABELS.map((label, i) => {
      const num = i + 1;
      const isActive = currentStep === num;
      const isDone = currentStep > num;
      return (
        <div key={label} className="flex items-center gap-2 flex-1 min-w-0">
          <span
            className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              isDone
                ? 'bg-emerald-500 text-white'
                : isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}
          >
            {isDone ? '✓' : num}
          </span>
          <span
            className={`text-xs font-semibold truncate hidden sm:block ${
              isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400'
            }`}
          >
            {label}
          </span>
          {i < STEP_LABELS.length - 1 && (
            <div
              className={`hidden sm:block flex-1 h-px ${
                currentStep > num ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'
              }`}
              aria-hidden="true"
            />
          )}
        </div>
      );
    })}
  </div>
);

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const { secondsLeft, isActive, start: startTimer } = useOtpTimer(60);

  const emailForm = useForm({ resolver: yupResolver(emailSchema), defaultValues: { email: '' } });
  const detailsForm = useForm({
    resolver: yupResolver(detailsSchema),
    defaultValues: { name: '', password: '', confirmPassword: '', acceptTerms: false },
  });
  const passwordValue = detailsForm.watch('password', '');

  useEffect(() => { dispatch(clearAuthError()); }, [dispatch]);
  useEffect(() => {
    if (isAuthenticated) navigate(ROUTES.DASHBOARD, { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSendOtp = async ({ email: formEmail }) => {
    setIsSendingOtp(true);
    const result = await dispatch(sendRegistrationOtp({ email: formEmail }));
    setIsSendingOtp(false);
    if (sendRegistrationOtp.fulfilled.match(result)) {
      setEmail(formEmail);
      setStep(STEPS.OTP);
      setOtp('');
      startTimer();
      toast.success('Verification code sent to your email.');
    } else {
      toast.error(result.payload?.message || 'Failed to send code.');
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { setOtpError('Enter the 6-digit code'); return; }
    setIsVerifyingOtp(true);
    const result = await dispatch(verifyRegistrationOtp({ email, otp }));
    setIsVerifyingOtp(false);
    if (verifyRegistrationOtp.fulfilled.match(result)) {
      setOtpError('');
      setStep(STEPS.DETAILS);
      toast.success('Email verified! Complete your profile.');
    } else {
      setOtpError(result.payload?.message || 'Invalid code.');
    }
  };

  const handleResendOtp = async () => {
    if (!isActive) {
      const result = await dispatch(sendRegistrationOtp({ email }));
      if (sendRegistrationOtp.fulfilled.match(result)) {
        startTimer();
        toast.success('New code sent.');
      } else {
        toast.error(result.payload?.message || 'Could not resend code.');
      }
    }
  };

  const handleRegister = async ({ name, password }) => {
    const result = await dispatch(registerUser({ name, email, password }));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Welcome to LifeVault!');
      navigate(ROUTES.DASHBOARD, { replace: true });
    } else {
      toast.error(result.payload?.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row relative">
      <ThemeToggle className="fixed top-4 right-4 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 shadow-sm" />
      {/* ── Left: photo panel (desktop) ── */}
      <div className="hidden lg:block lg:w-5/12 xl:w-1/2 relative h-full shrink-0 overflow-hidden">
        <HealthcareImage
          src={HEALTHCARE_IMAGES.register}
          alt="Healthy lifestyle and secure health management"
          className="absolute inset-0 h-full rounded-none shadow-none"
          rounded="rounded-none"
          hover={false}
          lazy={false}
          placeholderLabel="Add register-health.jpg"
        />

        <div
          className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/25 to-transparent pointer-events-none"
          aria-hidden="true"
        />

        <div className="absolute top-8 left-8 xl:top-10 xl:left-10 z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-lg">
            <FaShieldAlt className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <span className="font-extrabold text-xl text-white tracking-tight drop-shadow-sm">LifeVault</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute bottom-0 left-0 right-0 z-10 p-8 xl:p-10 text-white"
        >
          <h1 className="text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight drop-shadow-md">
            Set up your emergency vault.
          </h1>
          <p className="text-sm text-white/80 mt-3 leading-relaxed max-w-sm drop-shadow-sm">
            Three quick steps — verify your email, secure your account, and access your dashboard.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {STEP_LABELS.map((label, i) => (
              <span
                key={label}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border ${
                  step > i + 1
                    ? 'bg-emerald-500/30 border-emerald-400/40 text-white'
                    : step === i + 1
                      ? 'bg-white/20 border-white/30 text-white'
                      : 'bg-black/20 border-white/10 text-white/60'
                }`}
              >
                <span className="font-bold">{i + 1}.</span> {label}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Right: registration form ── */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-5 py-8 sm:px-8 lg:py-6 lg:min-h-0 lg:overflow-y-auto transition-colors duration-200">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-lg space-y-5"
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

          <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 to-indigo-500" aria-hidden="true" />

            <div className="p-6 sm:p-8">
              <StepProgress currentStep={step} />

              <AnimatePresence mode="wait">
                {step === STEPS.EMAIL && (
                  <motion.div
                    key="email"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create account</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 mb-5">
                      Enter your email to receive a verification code.
                    </p>
                    <form onSubmit={emailForm.handleSubmit(handleSendOtp)} className="space-y-4" noValidate>
                      <Input
                        label="Email"
                        type="email"
                        icon={FaEnvelope}
                        placeholder="you@example.com"
                        error={emailForm.formState.errors.email?.message}
                        autoComplete="email"
                        {...emailForm.register('email')}
                      />
                      <Button type="submit" fullWidth size="lg" isLoading={isSendingOtp}>
                        Send Verification Code
                      </Button>
                    </form>
                  </motion.div>
                )}

                {step === STEPS.OTP && (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                    className="text-center"
                  >
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Verify your email</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 mb-6">
                      Code sent to <strong className="text-slate-700 dark:text-slate-300">{email}</strong>
                    </p>
                    <OtpInput value={otp} onChange={setOtp} error={otpError} disabled={isVerifyingOtp} />
                    <Button fullWidth size="lg" className="mt-6" isLoading={isVerifyingOtp} onClick={handleVerifyOtp}>
                      Verify Code
                    </Button>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isActive}
                      className="mt-3 text-sm text-blue-600 dark:text-blue-400 disabled:text-slate-400 font-semibold"
                    >
                      {isActive ? `Resend in ${secondsLeft}s` : 'Resend code'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(STEPS.EMAIL)}
                      className="block mx-auto mt-3 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      Change email
                    </button>
                  </motion.div>
                )}

                {step === STEPS.DETAILS && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Complete your profile</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 mb-5">
                      Almost done — set your name and a secure password.
                    </p>
                    {authError && (
                      <p className="text-red-500 text-sm mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-800/30" role="alert">
                        {authError}
                      </p>
                    )}
                    <form onSubmit={detailsForm.handleSubmit(handleRegister)} className="space-y-4" noValidate>
                      <Input
                        label="Full Name"
                        icon={FaUser}
                        error={detailsForm.formState.errors.name?.message}
                        autoComplete="name"
                        {...detailsForm.register('name')}
                      />
                      <div>
                        <Input
                          label="Password"
                          type="password"
                          icon={FaLock}
                          error={detailsForm.formState.errors.password?.message}
                          autoComplete="new-password"
                          {...detailsForm.register('password')}
                        />
                        <PasswordStrengthMeter password={passwordValue} />
                      </div>
                      <Input
                        label="Confirm Password"
                        type="password"
                        icon={FaLock}
                        error={detailsForm.formState.errors.confirmPassword?.message}
                        autoComplete="new-password"
                        {...detailsForm.register('confirmPassword')}
                      />
                      <label className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/30"
                          {...detailsForm.register('acceptTerms')}
                        />
                        I agree to the Terms of Service and Privacy Policy.
                      </label>
                      {detailsForm.formState.errors.acceptTerms && (
                        <p className="text-xs text-red-500 -mt-2">{detailsForm.formState.errors.acceptTerms.message}</p>
                      )}
                      <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        isLoading={isLoading}
                        icon={FaChevronRight}
                        iconPosition="right"
                      >
                        Create Account
                      </Button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 pb-2 lg:pb-0">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
