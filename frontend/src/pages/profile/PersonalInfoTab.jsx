/**
 * pages/profile/PersonalInfoTab.jsx — Personal Details Editor
 *
 * Premium:
 * - Rounded profile picture capsule with smooth scale zoom, edit hover overlay, and status ring
 * - Organized input grids using theme tokens
 * - Staggered inputs and clear grouping
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaCamera, FaUser, FaEnvelope, FaCalendarAlt, FaRuler, FaWeight, FaMapMarkerAlt, FaLeaf } from 'react-icons/fa';

import {
  updateProfileDetails,
  uploadAvatar,
  selectProfile,
  selectProfileLoading,
} from '@/features/profile/profileSlice';
import { selectCurrentUser } from '@/features/auth/authSlice';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Button from '@/components/common/Button';
import Avatar from '@/components/common/Avatar';

const schema = yup.object().shape({
  dob: yup
    .date()
    .nullable()
    .transform((curr, orig) => (orig === '' ? null : curr))
    .max(new Date(), 'Date of birth cannot be in the future'),
  gender: yup.string().required('Gender is required'),
  bloodGroup: yup.string().required('Blood Group is required'),
  height: yup
    .number()
    .nullable()
    .transform((curr, orig) => (orig === '' || isNaN(orig) ? null : curr))
    .min(0, 'Height cannot be negative')
    .max(300, 'Please enter a valid height'),
  weight: yup
    .number()
    .nullable()
    .transform((curr, orig) => (orig === '' || isNaN(orig) ? null : curr))
    .min(0, 'Weight cannot be negative')
    .max(600, 'Please enter a valid weight'),
  address: yup.object().shape({
    street: yup.string().trim().max(100, 'Street name is too long'),
    city: yup.string().trim().max(50, 'City is too long'),
    state: yup.string().trim().max(50, 'State is too long'),
    pincode: yup.string().trim().max(15, 'Invalid Pincode length'),
    country: yup.string().trim().max(50, 'Country is too long'),
  }),
  isOrganDonor: yup.boolean(),
});

const PersonalInfoTab = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser) || {};
  const profile = useSelector(selectProfile) || {};
  const isSaving = useSelector(selectProfileLoading);

  const [photoUploading, setPhotoUploading] = useState(false);

  const genderOptions = [
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  const bloodOptions = [
    { value: 'unknown', label: 'Unknown' },
    { value: 'A+', label: 'A Positive (A+)' },
    { value: 'A-', label: 'A Negative (A-)' },
    { value: 'B+', label: 'B Positive (B+)' },
    { value: 'B-', label: 'B Negative (B-)' },
    { value: 'AB+', label: 'AB Positive (AB+)' },
    { value: 'AB-', label: 'AB Negative (AB-)' },
    { value: 'O+', label: 'O Positive (O+)' },
    { value: 'O-', label: 'O Negative (O-)' },
  ];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      dob: '',
      gender: 'prefer_not_to_say',
      bloodGroup: 'unknown',
      height: '',
      weight: '',
      address: { street: '', city: '', state: '', pincode: '', country: '' },
      isOrganDonor: false,
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '',
        gender: profile.gender || 'prefer_not_to_say',
        bloodGroup: profile.bloodGroup || 'unknown',
        height: profile.height || '',
        weight: profile.weight || '',
        address: {
          street: profile.address?.street || '',
          city: profile.address?.city || '',
          state: profile.address?.state || '',
          pincode: profile.address?.pincode || '',
          country: profile.address?.country || '',
        },
        isOrganDonor: profile.isOrganDonor || false,
      });
    }
  }, [profile, reset]);

  const onSubmit = async (formData) => {
    const result = await dispatch(updateProfileDetails(formData));
    if (updateProfileDetails.fulfilled.match(result)) {
      toast.success('Personal details saved successfully.');
    } else {
      toast.error(result.payload?.message || 'Failed to save profile. Reconnecting...');
    }
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large. Maximum size allowed is 2MB.');
      return;
    }

    setPhotoUploading(true);
    const result = await dispatch(uploadAvatar(file));
    setPhotoUploading(false);

    if (uploadAvatar.fulfilled.match(result)) {
      toast.success('Profile photo updated successfully!');
    } else {
      toast.error(result.payload?.message || 'Avatar upload failed.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* ── LEFT PANEL: AVATAR CARD ── */}
      <div className="lg:col-span-4 flex flex-col items-center">
        <div className="relative group w-32 h-32 mb-4 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-[0_8px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.3)]">
          <Avatar
            src={user.profilePhoto?.url}
            name={user.name}
            size="2xl"
            className="w-full h-full"
          />

          {/* Photo upload trigger button overlay */}
          <label className="absolute inset-0 bg-slate-950/65 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity duration-200">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              disabled={photoUploading}
              className="hidden"
            />
            {photoUploading ? (
              <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <>
                <FaCamera className="h-5 w-5 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
              </>
            )}
          </label>
        </div>

        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
          {user.name}
        </h3>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest font-extrabold">
          Role: {user.role || 'User'}
        </p>
      </div>

      {/* ── RIGHT PANEL: MAIN FORM ── */}
      <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-8 space-y-6">
        {/* Read-Only Account Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/40 p-4.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80">
          <Input
            label="Name (Account Root)"
            name="accountName"
            icon={FaUser}
            value={user.name}
            disabled
            helperText="Change account name in settings page"
          />
          <Input
            label="Email (Account Root)"
            name="accountEmail"
            icon={FaEnvelope}
            value={user.email}
            disabled
          />
        </div>

        {/* Profile Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Date of Birth"
            name="dob"
            type="date"
            icon={FaCalendarAlt}
            error={errors.dob?.message}
            {...register('dob')}
          />
          <Select
            label="Gender"
            name="gender"
            options={genderOptions}
            error={errors.gender?.message}
            {...register('gender')}
          />
          <Select
            label="Blood Group"
            name="bloodGroup"
            options={bloodOptions}
            error={errors.bloodGroup?.message}
            {...register('bloodGroup')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Height (cm)"
            name="height"
            type="number"
            icon={FaRuler}
            placeholder="e.g. 175"
            error={errors.height?.message}
            {...register('height')}
          />
          <Input
            label="Weight (kg)"
            name="weight"
            type="number"
            icon={FaWeight}
            placeholder="e.g. 70"
            error={errors.weight?.message}
            {...register('weight')}
          />
        </div>

        {/* Address Inputs */}
        <div className="space-y-4 pt-2">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <FaMapMarkerAlt className="text-blue-500" aria-hidden="true" />
            Home Address
          </h4>

          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Street Address"
              name="address.street"
              placeholder="e.g. 123 Main St, Apt 4"
              error={errors.address?.street?.message}
              {...register('address.street')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="City"
              name="address.city"
              placeholder="e.g. San Francisco"
              error={errors.address?.city?.message}
              {...register('address.city')}
            />
            <Input
              label="State / Region"
              name="address.state"
              placeholder="e.g. California"
              error={errors.address?.state?.message}
              {...register('address.state')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Pincode / Zipcode"
              name="address.pincode"
              placeholder="e.g. 94103"
              error={errors.address?.pincode?.message}
              {...register('address.pincode')}
            />
            <Input
              label="Country"
              name="address.country"
              placeholder="e.g. United States"
              error={errors.address?.country?.message}
              {...register('address.country')}
            />
          </div>
        </div>

        {/* Organ Donor Status */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
          <div className="flex items-start gap-3">
            <FaLeaf className="text-emerald-500 mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Organ Donor
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Displayed on your emergency QR profile to notify first responders and medical teams.
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
            <input
              type="checkbox"
              className="sr-only peer"
              {...register('isOrganDonor')}
            />
            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:ring-2 peer-focus:ring-emerald-400/40 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
          </label>
        </div>

        {/* Submit Actions */}
        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-6 flex justify-end">
          <Button
            type="submit"
            isLoading={isSaving}
            isDisabled={!isDirty}
            size="md"
          >
            Save Personal Details
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PersonalInfoTab;
