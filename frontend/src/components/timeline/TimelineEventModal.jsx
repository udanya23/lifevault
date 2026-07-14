/**
 * components/timeline/TimelineEventModal.jsx — Create / edit timeline event
 */

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaCalendarAlt, FaFileMedical } from 'react-icons/fa';

import { TIMELINE_CATEGORIES, ALLOWED_DOCUMENT_TYPES, MAX_FILE_SIZE_BYTES } from '@/utils/constants';
import { validateFile } from '@/utils/helpers';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Button from '@/components/common/Button';

const schema = yup.object().shape({
  eventDate: yup.string().required('Event date is required'),
  category: yup.string().required('Category is required'),
  eventType: yup.string().trim().max(120),
  doctor: yup.string().trim().max(120),
  hospital: yup.string().trim().max(160),
  description: yup.string().trim().max(2000),
  notes: yup.string().trim().max(4000),
});

const toDateInput = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

const TimelineEventModal = ({ isOpen, onClose, onSubmit, event, isSubmitting }) => {
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      eventDate: '',
      category: '',
      eventType: '',
      doctor: '',
      hospital: '',
      description: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    setFiles([]);
    reset({
      eventDate: toDateInput(event?.eventDate),
      category: event?.category || '',
      eventType: event?.eventType || '',
      doctor: event?.doctor || '',
      hospital: event?.hospital || '',
      description: event?.description || '',
      notes: event?.notes || '',
    });
  }, [isOpen, event, reset]);

  const handleFilesChange = (e) => {
    const selected = Array.from(e.target.files || []);
    const valid = [];
    for (const file of selected) {
      const err = validateFile(file, ALLOWED_DOCUMENT_TYPES, MAX_FILE_SIZE_BYTES);
      if (err) continue;
      valid.push(file);
    }
    setFiles(valid.slice(0, 5));
  };

  const submit = (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value);
      }
    });
    if (!data.eventType && data.category) {
      formData.append('eventType', data.category);
    }
    files.forEach((file) => formData.append('timelineFiles', file));
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={event ? 'Edit Timeline Event' : 'Add Timeline Event'}
      subtitle="Record a health event with optional reports attached."
      icon={FaFileMedical}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit(submit)} isLoading={isSubmitting}>
            {event ? 'Save Changes' : 'Add Event'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Event Date"
            type="date"
            icon={FaCalendarAlt}
            error={errors.eventDate?.message}
            required
            {...register('eventDate')}
          />
          <Select
            label="Category"
            options={TIMELINE_CATEGORIES}
            error={errors.category?.message}
            required
            {...register('category')}
          />
        </div>

        <Input label="Event Type" placeholder="e.g. Annual checkup" error={errors.eventType?.message} {...register('eventType')} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Doctor" placeholder="Dr. Smith" error={errors.doctor?.message} {...register('doctor')} />
          <Input label="Hospital / Clinic" placeholder="City Hospital" error={errors.hospital?.message} {...register('hospital')} />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">Description</label>
          <textarea
            rows={3}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/30 outline-none"
            placeholder="What happened during this visit or event?"
            {...register('description')}
          />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">Notes</label>
          <textarea
            rows={2}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/30 outline-none"
            placeholder="Additional notes for your records"
            {...register('notes')}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
            Attach Reports (PDF or image, max 5)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFilesChange}
            className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-950/40 dark:file:text-blue-300"
          />
          {files.length > 0 && (
            <p className="text-[11px] text-slate-400 mt-1">{files.length} file(s) selected</p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default TimelineEventModal;
