/**
 * pages/profile/EmergencyContactsTab.jsx — Emergency Contact Manager
 *
 * Premium:
 * - Cards using theme tokens and elegant left accent stripes
 * - Improved empty states
 * - Custom popup modal leveraging subtitle and footer layout slots
 * - Polish details for interactive actions (edit, delete, call)
 */

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { FaUserPlus, FaEdit, FaTrash, FaPhone, FaExclamationTriangle, FaUser } from 'react-icons/fa';

import {
  fetchContacts,
  addContact,
  editContact,
  removeContact,
  selectContacts,
} from '@/features/profile/profileSlice';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Modal from '@/components/common/Modal';
import Badge from '@/components/common/Badge';
import Card from '@/components/common/Card';
import HealthcareImage from '@/components/common/HealthcareImage';
import { HEALTHCARE_IMAGES } from '@/utils/imageAssets';

const schema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required('Contact name is required')
    .max(50, 'Name is too long')
    .matches(/^[a-zA-Z\s.-]+$/, 'Name can only contain letters, spaces, hyphens, and dots'),
  relationship: yup.string().required('Relationship is required'),
  phone: yup
    .string()
    .trim()
    .required('Phone number is required')
    .matches(/^[0-9+\s()-]{7,20}$/, 'Invalid phone number format'),
  isPrimary: yup.boolean().default(false),
});

const EmergencyContactsTab = () => {
  const dispatch = useDispatch();
  const contacts = useSelector(selectContacts) || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const relationships = [
    'Spouse',
    'Father',
    'Mother',
    'Brother',
    'Sister',
    'Son',
    'Daughter',
    'Partner',
    'Friend',
    'Doctor',
    'Other',
  ];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      relationship: '',
      phone: '',
      isPrimary: false,
    },
  });

  useEffect(() => {
    dispatch(fetchContacts());
  }, [dispatch]);

  const handleOpenEdit = (contact) => {
    setEditingContact(contact);
    reset({
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      isPrimary: contact.isPrimary,
    });
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingContact(null);
    reset({
      name: '',
      relationship: '',
      phone: '',
      isPrimary: contacts.length === 0,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    let result;

    if (editingContact) {
      result = await dispatch(editContact({ id: editingContact._id, data }));
    } else {
      result = await dispatch(addContact(data));
    }

    setSubmitting(false);

    if (addContact.fulfilled.match(result) || editContact.fulfilled.match(result)) {
      toast.success(
        editingContact
          ? 'Emergency contact updated.'
          : 'Emergency contact added.'
      );
      setIsModalOpen(false);
    } else {
      toast.error(result.payload?.message || 'Operation failed. Please try again.');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove ${name} from emergency contacts?`)) {
      const result = await dispatch(removeContact(id));
      if (removeContact.fulfilled.match(result)) {
        toast.success('Emergency contact removed.');
      } else {
        toast.error(result.payload?.message || 'Delete failed.');
      }
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Emergency Contacts List
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Responders can view these contacts instantly during QR scans. Add up to 5 entries.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenCreate}
          isDisabled={contacts.length >= 5}
          icon={FaUserPlus}
          size="sm"
        >
          Add Contact ({contacts.length}/5)
        </Button>
      </div>

      {/* Limit notice */}
      {contacts.length >= 5 && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-amber-800 dark:text-amber-300 text-xs">
          <FaExclamationTriangle className="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
          <span className="font-semibold">Maximum contact limit (5) reached. Delete an entry to add another.</span>
        </div>
      )}

      {/* Grid of contact cards + family care visual */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
      {contacts.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center gap-3">
          <span className="text-4xl" aria-hidden="true">📞</span>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-250">
              No contacts registered
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm px-4">
              Add at least one next-of-kin contact so responders can alert them in an emergency.
            </p>
          </div>
          <Button variant="outline" onClick={handleOpenCreate} icon={FaUserPlus} className="mt-2">
            Add Primary Contact
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map((contact) => (
            <Card
              key={contact._id}
              padding="md"
              variant="default"
              className={`relative overflow-hidden group border-slate-200 dark:border-slate-700/80 ${
                contact.isPrimary ? 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[4px] before:bg-red-500' : ''
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                      {contact.name}
                    </h4>
                    {contact.isPrimary && (
                      <Badge variant="danger" size="sm" className="font-extrabold uppercase text-[9px]">
                        Primary
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-550 mt-1.5 font-medium">
                    Relationship: <span className="text-slate-700 dark:text-slate-300 font-semibold">{contact.relationship}</span>
                  </p>
                </div>

                {/* Edit and Delete Actions */}
                <div className="flex gap-0.5">
                  <button
                    onClick={() => handleOpenEdit(contact)}
                    className="p-2 rounded-lg text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
                    title="Edit Contact"
                  >
                    <FaEdit className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => handleDelete(contact._id, contact.name)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
                    title="Delete Contact"
                  >
                    <FaTrash className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <FaPhone className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
                <a
                  href={`tel:${contact.phone}`}
                  className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors truncate"
                >
                  {contact.phone}
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}

        </div>

        <HealthcareImage
          src={HEALTHCARE_IMAGES.familyCare}
          alt="Family care and emergency contact support"
          className="lg:col-span-4 min-h-[240px] lg:min-h-[320px] hidden lg:block"
          rounded="rounded-2xl"
          placeholderLabel="Add family-care.jpg to public/images/"
        />
      </div>

      {/* ── ADD/EDIT CONTACT POPUP MODAL ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
        subtitle={editingContact ? 'Modify details for this key responder.' : 'Provide details for a next-of-kin responder.'}
        icon={FaUser}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} size="sm">
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)} isLoading={submitting} size="sm">
              {editingContact ? 'Save Changes' : 'Add Contact'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 pt-1">
          <Input
            label="Contact Full Name"
            name="name"
            placeholder="e.g. Jane Doe"
            error={errors.name?.message}
            required
            {...register('name')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Relationship"
              name="relationship"
              options={relationships}
              error={errors.relationship?.message}
              required
              {...register('relationship')}
            />
            <Input
              label="Phone Number"
              name="phone"
              placeholder="e.g. +1 (555) 0199"
              error={errors.phone?.message}
              required
              {...register('phone')}
            />
          </div>

          <div className="flex items-center gap-2.5 pt-2 select-none">
            <input
              type="checkbox"
              id="isPrimary"
              className="w-4 h-4 rounded text-blue-600 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-blue-500/30 focus:ring-2 cursor-pointer"
              {...register('isPrimary')}
            />
            <label htmlFor="isPrimary" className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
              Mark as Primary Contact (rescuers will see this name first)
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmergencyContactsTab;
