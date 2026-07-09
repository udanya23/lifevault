/**
 * pages/documents/DocumentsPage.jsx — Secure Document Vault
 *
 * Premium:
 * - Cards featuring left indicator line, dynamic icons, hover lift, type labels
 * - Standardized Modal styling with top gradients, subtitle explanations, and custom footers
 * - Refined file drop zone text buttons
 */

import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  FaFolderOpen,
  FaUpload,
  FaTrash,
  FaExternalLinkAlt,
  FaFilePdf,
  FaFileImage,
  FaSpinner,
  FaIdCard,
  FaPassport,
  FaCar,
  FaShieldAlt,
  FaFileMedical,
} from 'react-icons/fa';

import {
  fetchDocuments,
  uploadDocument,
  deleteDocument,
  selectDocuments,
  selectDocumentsLoading,
  selectDocumentsUploading,
} from '@/features/documents/documentSlice';
import {
  DOCUMENT_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  MAX_FILE_SIZE_BYTES,
} from '@/utils/constants';
import { formatDate, validateFile } from '@/utils/helpers';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Modal from '@/components/common/Modal';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import HealthcareImage from '@/components/common/HealthcareImage';
import { HEALTHCARE_IMAGES } from '@/utils/imageAssets';

const TYPE_ICONS = {
  aadhaar: FaIdCard,
  pan: FaIdCard,
  passport: FaPassport,
  drivingLicense: FaCar,
  insurance: FaShieldAlt,
  medicalReport: FaFileMedical,
};

const schema = yup.object().shape({
  name: yup.string().trim().required('Document name is required').max(100),
  type: yup.string().required('Document type is required'),
});

const DocumentsPage = () => {
  const dispatch = useDispatch();
  const documents = useSelector(selectDocuments) || [];
  const isLoading = useSelector(selectDocumentsLoading);
  const isUploading = useSelector(selectDocumentsUploading);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: '', type: '' },
  });

  useEffect(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);

  const getTypeLabel = (type) =>
    DOCUMENT_TYPES.find((t) => t.value === type)?.label || type;

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file, ALLOWED_DOCUMENT_TYPES, MAX_FILE_SIZE_BYTES);
    if (!validation.valid) {
      toast.error(validation.error);
      e.target.value = '';
      return;
    }
    setSelectedFile(file);
  };

  const onUploadSubmit = async (data) => {
    if (!selectedFile) {
      toast.error('Please select a file to upload.');
      return;
    }

    try {
      await dispatch(
        uploadDocument({ file: selectedFile, name: data.name, type: data.type })
      ).unwrap();
      toast.success('Document uploaded securely.');
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      reset();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      toast.error(err?.message || 'Upload failed. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(deleteDocument(deleteTarget._id)).unwrap();
      toast.success('Document removed from vault.');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.message || 'Failed to delete document.');
    }
  };

  const openUploadModal = () => {
    reset();
    setSelectedFile(null);
    setIsUploadModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <FaSpinner className="h-8 w-8 text-blue-600 animate-spin" aria-hidden="true" />
          <p className="text-sm font-semibold text-slate-500">Loading secure documents…</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 text-left"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
            Secure Document Vault
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Store identity credentials, health insurance policies, and clinical reports. These files are never exposed on your QR card.
          </p>
        </div>
        <Button variant="primary" icon={FaUpload} onClick={openUploadModal} size="sm">
          Upload Document
        </Button>
      </div>

      {/* Empty State */}
      {documents.length === 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <Card className="text-center py-16 flex flex-col items-center gap-4 border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 dark:text-slate-600">
              <FaFolderOpen className="h-8 w-8" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No documents uploaded
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mt-1 mx-auto leading-relaxed">
                Upload critical identity or health insurance records. They are protected using military-grade security standards.
              </p>
            </div>
            <Button variant="outline" icon={FaUpload} onClick={openUploadModal} className="mt-2">
              Upload Your First Document
            </Button>
          </Card>
          <HealthcareImage
            src={HEALTHCARE_IMAGES.medicalRecords}
            alt="Secure medical records and health documents"
            className="min-h-[280px] lg:min-h-full"
            rounded="rounded-2xl"
            placeholderLabel="Add medical-records.jpg to public/images/"
          />
        </div>
      ) : (
        /* Document Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => {
            const TypeIcon = TYPE_ICONS[doc.type] || FaFileMedical;
            const isPdf = doc.fileUrl?.includes('.pdf') || doc.fileUrl?.endsWith('/pdf');

            return (
              <Card
                key={doc._id}
                isHoverable
                className="flex flex-col border-slate-205 dark:border-slate-700/80 p-5 rounded-2xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/25 text-blue-600 dark:text-blue-400 shrink-0">
                      <TypeIcon className="h-4.5 w-4.5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-850 dark:text-white truncate">
                        {doc.name}
                      </p>
                      <Badge variant="primary" size="sm" className="mt-1 font-bold text-[9px] uppercase">
                        {getTypeLabel(doc.type)}
                      </Badge>
                    </div>
                  </div>
                  {isPdf ? (
                    <FaFilePdf className="h-4.5 w-4.5 text-red-500 shrink-0" aria-hidden="true" />
                  ) : (
                    <FaFileImage className="h-4.5 w-4.5 text-emerald-500 shrink-0" aria-hidden="true" />
                  )}
                </div>

                <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-5 font-semibold">
                  Uploaded {formatDate(doc.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>

                <div className="flex gap-2 mt-auto">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" fullWidth icon={FaExternalLinkAlt}>
                      View File
                    </Button>
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-650 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                    icon={FaTrash}
                    onClick={() => setDeleteTarget(doc)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Secure Document"
        subtitle="Your documents are stored securely and never visible during emergency QR scans."
        icon={FaUpload}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsUploadModalOpen(false)} size="sm">
              Cancel
            </Button>
            <Button onClick={handleSubmit(onUploadSubmit)} isLoading={isUploading} size="sm">
              Upload File
            </Button>
          </div>
        }
      >
        <div className="space-y-4 pt-1">
          <Input
            label="Document Name"
            placeholder="e.g. Health Insurance Card"
            error={errors.name?.message}
            required
            {...register('name')}
          />

          <Select
            label="Document Type"
            options={DOCUMENT_TYPES}
            placeholder="Select type…"
            error={errors.type?.message}
            required
            {...register('type')}
          />

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
              File (PDF or Image, max 5MB)
            </label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700/80 rounded-xl p-6 bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100/50 dark:hover:bg-slate-900/60 transition-colors duration-150 relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <FaUpload className="h-6 w-6 text-slate-400 mb-2" aria-hidden="true" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {selectedFile ? 'Change selected file' : 'Choose document file'}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-550 mt-1">
                Supports PDF, JPG, PNG, WEBP up to 5MB
              </span>
            </div>
            {selectedFile && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-2.5 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-lg border border-emerald-100/60 dark:border-emerald-900/20 w-fit">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="truncate max-w-xs">{selectedFile.name}</span>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Secure Document"
        subtitle="This action is permanent and cannot be undone."
        icon={FaTrash}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} size="sm">
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} size="sm">
              Delete Permanently
            </Button>
          </div>
        }
      >
        <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed pt-1">
          Are you sure you want to permanently delete the document{' '}
          <strong className="text-slate-800 dark:text-white">{deleteTarget?.name}</strong>? It will be deleted from the encrypted storage vault immediately.
        </p>
      </Modal>
    </motion.div>
  );
};

export default DocumentsPage;
