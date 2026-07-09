/**
 * pages/auth/ResetPasswordPage.jsx — Reset password with OTP (from forgot flow)
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLock, FaCheckCircle } from 'react-icons/fa';

import { resetPasswordWithOtp } from '@/features/auth/authSlice';
import { authAPI } from '@/api/authAPI';
import { ROUTES } from '@/utils/constants';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import PasswordStrengthMeter from '@/components/common/PasswordStrengthMeter';

const schema = yup.object({
  password: yup.string().required('Password is required').min(8)
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/, 'Must include upper, lower, number & symbol'),
  confirmPassword: yup.string().required('Confirm password').oneOf([yup.ref('password')], 'Passwords do not match'),
});

const ResetPasswordPage = () => {
  const { token } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const otpFlow = location.state?.email && location.state?.otp;
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });
  const passwordValue = watch('password', '');

  useEffect(() => {
    if (!otpFlow && !token) navigate(ROUTES.FORGOT_PASSWORD, { replace: true });
  }, [otpFlow, token, navigate]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (otpFlow) {
        const result = await dispatch(resetPasswordWithOtp({
          email: location.state.email,
          otp: location.state.otp,
          password: data.password,
        }));
        if (resetPasswordWithOtp.rejected.match(result)) {
          throw new Error(result.payload?.message || 'Reset failed');
        }
      } else {
        await authAPI.resetPassword(token, { password: data.password });
      }
      setIsSuccess(true);
      toast.success('Password reset successfully!');
    } catch (error) {
      toast.error(error.message || error.response?.data?.message || 'Reset failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card padding="lg">
                <h2 className="text-xl font-bold mb-6">Set new password</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Input label="New Password" type="password" icon={FaLock} error={errors.password?.message} {...register('password')} />
                    <PasswordStrengthMeter password={passwordValue} />
                  </div>
                  <Input label="Confirm Password" type="password" icon={FaLock} error={errors.confirmPassword?.message} {...register('confirmPassword')} />
                  <Button type="submit" fullWidth isLoading={isLoading}>Reset Password</Button>
                </form>
              </Card>
            </motion.div>
          ) : (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card padding="lg" className="text-center">
                <FaCheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Password Updated</h2>
                <p className="text-sm text-slate-500 mb-6">You can now sign in with your new password.</p>
                <Link to={ROUTES.LOGIN}><Button fullWidth>Sign In</Button></Link>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
