/**
 * pages/auth/ForgotPasswordPage.jsx — OTP-based forgot password (steps 1–2)
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaChevronLeft } from 'react-icons/fa';

import { sendForgotPasswordOtp, verifyForgotPasswordOtp } from '@/features/auth/authSlice';
import { ROUTES } from '@/utils/constants';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import OtpInput from '@/components/common/OtpInput';
import useOtpTimer from '@/hooks/useOtpTimer';

const emailSchema = yup.object({
  email: yup.string().trim().required('Email is required').email('Enter a valid email'),
});

const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { secondsLeft, isActive, start: startTimer } = useOtpTimer(60);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(emailSchema),
  });

  const onSendOtp = async (data) => {
    setIsLoading(true);
    const result = await dispatch(sendForgotPasswordOtp({ email: data.email }));
    setIsLoading(false);
    if (sendForgotPasswordOtp.fulfilled.match(result)) {
      setEmail(data.email);
      setStep(2);
      startTimer();
      toast.success('Reset code sent if the email exists.');
    } else {
      toast.error(result.payload?.message || 'Something went wrong.');
    }
  };

  const onVerifyOtp = async () => {
    if (otp.length !== 6) { setOtpError('Enter the 6-digit code'); return; }
    setIsLoading(true);
    const result = await dispatch(verifyForgotPasswordOtp({ email, otp }));
    setIsLoading(false);
    if (verifyForgotPasswordOtp.fulfilled.match(result)) {
      navigate(ROUTES.RESET_PASSWORD, { state: { email, otp } });
    } else {
      setOtpError(result.payload?.message || 'Invalid code.');
    }
  };

  const handleResend = async () => {
    if (!isActive) {
      const result = await dispatch(sendForgotPasswordOtp({ email }));
      if (sendForgotPasswordOtp.fulfilled.match(result)) {
        startTimer();
        toast.success('New code sent.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div key="email" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card padding="lg">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Forgot Password?</h2>
                <p className="text-xs text-slate-500 mb-6">Enter your email and we'll send a reset code.</p>
                <form onSubmit={handleSubmit(onSendOtp)} className="space-y-4">
                  <Input label="Email" type="email" icon={FaEnvelope} error={errors.email?.message} {...register('email')} />
                  <Button type="submit" fullWidth isLoading={isLoading}>Send Reset Code</Button>
                </form>
                <Link to={ROUTES.LOGIN} className="inline-flex items-center gap-1 mt-6 text-xs text-slate-500 font-semibold">
                  <FaChevronLeft className="w-3 h-3" /> Back to sign in
                </Link>
              </Card>
            </motion.div>
          ) : (
            <motion.div key="otp" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <Card padding="lg">
                <h2 className="text-xl font-bold mb-2">Enter reset code</h2>
                <p className="text-xs text-slate-500 mb-8">Sent to <strong>{email}</strong></p>
                <OtpInput value={otp} onChange={setOtp} error={otpError} disabled={isLoading} />
                <Button fullWidth className="mt-8" isLoading={isLoading} onClick={onVerifyOtp}>Verify Code</Button>
                <button type="button" onClick={handleResend} disabled={isActive}
                  className="mt-4 text-sm text-blue-600 disabled:text-slate-400 font-semibold">
                  {isActive ? `Resend in ${secondsLeft}s` : 'Resend code'}
                </button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
