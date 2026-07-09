/**
 * pages/qr/QRCodePage.jsx — QR Code & Emergency Access Page
 *
 * Premium:
 * - Rounded QR code container card with custom focus shadows
 * - Separated Visibility panels (Visible on Scan / Never Exposed) using green/red accent lines
 * - Layout improvements with clean typography and metadata details
 */

import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  FaQrcode,
  FaCopy,
  FaSync,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaCheckCircle,
  FaChartLine,
  FaPrint,
} from 'react-icons/fa';

import {
  fetchQRData,
  regenerateQR,
  selectQRData,
  selectQRLoading,
} from '@/features/qr/qrSlice';
import { fetchProfile, selectProfile } from '@/features/profile/profileSlice';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { formatRelativeTime } from '@/utils/helpers';
import { printWalletCard, getQrDataUrlFromCanvas } from '@/utils/printWalletCard';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import WalletCard from '@/components/qr/WalletCard';
import HealthcareImage from '@/components/common/HealthcareImage';
import { HEALTHCARE_IMAGES } from '@/utils/imageAssets';

const QRCodePage = () => {
  const dispatch = useDispatch();
  const qrData = useSelector(selectQRData);
  const isLoading = useSelector(selectQRLoading);
  const user = useSelector(selectCurrentUser) || {};
  const profile = useSelector(selectProfile);
  const qrCanvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [showWalletCardModal, setShowWalletCardModal] = useState(false);

  useEffect(() => {
    dispatch(fetchQRData());
    dispatch(fetchProfile());
  }, [dispatch]);

  const handleCopyUrl = async () => {
    if (!qrData?.emergencyUrl) return;
    try {
      await navigator.clipboard.writeText(qrData.emergencyUrl);
      setCopied(true);
      toast.success('Emergency URL copied to clipboard.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy URL.');
    }
  };

  const handleRegenerate = async () => {
    try {
      await dispatch(regenerateQR()).unwrap();
      toast.success('New QR code generated. Old links are now invalid.');
      setShowRegenerateModal(false);
    } catch (err) {
      toast.error(err?.message || 'Failed to regenerate QR code.');
    }
  };

  const handlePrintWalletCard = () => {
    if (!qrData?.emergencyUrl) {
      toast.error('Generate a QR code before printing your wallet card.');
      return;
    }
    try {
      const qrDataUrl = getQrDataUrlFromCanvas(qrCanvasRef.current);
      if (!qrDataUrl) {
        toast.error('Could not prepare QR image for printing.');
        return;
      }
      printWalletCard({
        name: user.name || 'LifeVault User',
        bloodGroup: profile?.bloodGroup,
        emergencyUrl: qrData.emergencyUrl,
        qrDataUrl,
      });
      toast.info('Print dialog opened — choose your printer or Save as PDF.');
    } catch (err) {
      toast.error(err.message || 'Failed to open print window. Allow pop-ups and try again.');
    }
  };

  const displayName = user.name || 'Your Name';
  const bloodGroup = profile?.bloodGroup;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <FaSpinner className="h-8 w-8 text-blue-600 animate-spin" aria-hidden="true" />
          <p className="text-sm font-semibold text-slate-500">Generating emergency access QR…</p>
        </div>
      </div>
    );
  }

  const hasData = qrData && qrData.emergencyUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 text-left"
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
            Your Emergency QR Code
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            First responders scan this to view life-saving medical details instantly — private documents remain locked.
          </p>
        </div>
        {hasData && (
          <Button
            variant="primary"
            size="sm"
            icon={FaPrint}
            onClick={() => setShowWalletCardModal(true)}
          >
            Print Wallet Card
          </Button>
        )}
      </div>

      {/* Hidden canvas for high-res print export */}
      {hasData && (
        <div className="sr-only" aria-hidden="true">
          <QRCodeCanvas
            ref={qrCanvasRef}
            value={qrData.emergencyUrl}
            size={256}
            level="H"
            includeMargin
            bgColor="#ffffff"
            fgColor="#0f172a"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* QR Display + companion visual */}
        <div className="lg:col-span-6 flex flex-col sm:flex-row gap-4">
          <Card variant="default" padding="lg" className="flex flex-col items-center text-center border-slate-205 dark:border-slate-700/80 flex-1">
          <div className="p-4 bg-white rounded-2xl shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] border border-slate-100 dark:border-slate-700/20 mb-5">
            {hasData ? (
              <QRCodeSVG
                value={qrData.emergencyUrl}
                size={180}
                level="H"
                includeMargin
                bgColor="#ffffff"
                fgColor="#0f172a"
              />
            ) : (
              <FaQrcode className="h-44 w-44 text-slate-200" aria-hidden="true" />
            )}
          </div>

          {hasData && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-5 break-all max-w-xs font-semibold">
              {qrData.emergencyUrl}
            </p>
          )}

          <div className="flex gap-2.5 w-full max-w-xs justify-center">
            <Button
              variant="outline"
              size="sm"
              icon={copied ? FaCheckCircle : FaCopy}
              onClick={handleCopyUrl}
              className="flex-1"
            >
              {copied ? 'Copied' : 'Copy Link'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={FaSync}
              isLoading={qrData?.isRegenerating}
              onClick={() => setShowRegenerateModal(true)}
              className="flex-1"
            >
              Regenerate
            </Button>
          </div>
        </Card>

          <HealthcareImage
            src={HEALTHCARE_IMAGES.emergencyQr}
            alt="Emergency QR code access for first responders"
            className="hidden sm:block flex-1 min-h-[200px] sm:min-h-0 sm:max-w-[200px] lg:max-w-none"
            rounded="rounded-2xl"
            placeholderLabel="Add emergency-qr.jpg to public/images/"
          />
        </div>

        {/* Stats & Privacy */}
        <div className="lg:col-span-6 space-y-4">
          <Card variant="default" className="border-slate-205 dark:border-slate-700/80">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2 select-none">
              <FaChartLine className="text-blue-500" aria-hidden="true" /> Scan Analytics
            </h3>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                {qrData?.totalScans || 0}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-semibold">
                Total times your QR code card has been scanned by emergency responders.
              </p>
            </div>
            {qrData?.recentScans?.length > 0 && (
              <ul className="mt-4 space-y-2.5 border-t border-slate-100 dark:border-slate-800 pt-3.5">
                {qrData.recentScans.slice(0, 3).map((scan, i) => (
                  <li key={i} className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between font-semibold">
                    <span>Scanner IP: {scan.scannerIp || 'Unknown'}</span>
                    <span className="text-slate-400">{formatRelativeTime(scan.scannedAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Visible on Scan details */}
          <Card variant="default" className="border-slate-205 dark:border-slate-750/80 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-emerald-500" aria-hidden="true" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3.5 flex items-center gap-2 select-none pl-1">
              <FaEye className="text-emerald-500" aria-hidden="true" /> Visible on Scan
            </h3>
            <div className="flex flex-wrap gap-1.5 pl-1">
              {['Name', 'Blood Group', 'Emergency Contacts', 'Allergies', 'Medicines'].map(
                (field) => (
                  <Badge key={field} variant="success" size="sm">
                    {field}
                  </Badge>
                )
              )}
            </div>
          </Card>

          {/* Never Exposed details */}
          <Card variant="default" className="border-slate-205 dark:border-slate-750/80 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-red-500" aria-hidden="true" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3.5 flex items-center gap-2 select-none pl-1">
              <FaEyeSlash className="text-red-500" aria-hidden="true" /> Never Exposed
            </h3>
            <div className="flex flex-wrap gap-1.5 pl-1">
              {['Address', 'Email Address', 'Vault Documents', 'Medical Notes', 'Password'].map(
                (field) => (
                  <Badge key={field} variant="danger" size="sm">
                    {field}
                  </Badge>
                )
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Wallet card preview & print */}
      <Modal
        isOpen={showWalletCardModal}
        onClose={() => setShowWalletCardModal(false)}
        title="Emergency Wallet Card"
        subtitle="Standard credit-card size — print and keep in your wallet or phone case."
        icon={FaPrint}
        footer={
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => setShowWalletCardModal(false)} size="sm">
              Close
            </Button>
            <Button variant="primary" icon={FaPrint} onClick={handlePrintWalletCard} size="sm">
              Print / Save as PDF
            </Button>
          </div>
        }
      >
        <div className="flex flex-col items-center gap-5 pt-2 pb-1">
          <WalletCard
            name={displayName}
            bloodGroup={bloodGroup}
            emergencyUrl={qrData?.emergencyUrl}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-sm leading-relaxed">
            Tip: Use glossy paper or laminate for durability. Update your profile blood group in{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">Profile</span> before printing.
          </p>
        </div>
      </Modal>

      {/* Regenerate Confirmation */}
      <Modal
        isOpen={showRegenerateModal}
        onClose={() => setShowRegenerateModal(false)}
        title="Regenerate QR Code"
        subtitle="This action invalidates all previous QR code prints & links."
        icon={FaSync}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowRegenerateModal(false)} size="sm">
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={FaSync}
              isLoading={qrData?.isRegenerating}
              onClick={handleRegenerate}
              size="sm"
            >
              Regenerate QR
            </Button>
          </div>
        }
      >
        <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed pt-1">
          Are you sure you want to generate a new emergency QR code? Any existing physical wallet cards, decals, or decals you printed will become inactive immediately.
        </p>
      </Modal>
    </motion.div>
  );
};

export default QRCodePage;
