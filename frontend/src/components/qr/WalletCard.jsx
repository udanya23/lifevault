/**
 * WalletCard — printable emergency ID card preview (credit-card proportions)
 */

import { QRCodeSVG } from 'qrcode.react';
import { FaShieldAlt } from 'react-icons/fa';

const WalletCard = ({
  name = 'Your Name',
  bloodGroup,
  emergencyUrl,
  className = '',
  showUrl = true,
}) => {
  const bloodLabel =
    bloodGroup && bloodGroup !== 'unknown' ? bloodGroup : 'Not set';

  return (
    <div
      className={`wallet-card relative w-[340px] h-[214px] rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white text-slate-900 select-none ${className}`}
      aria-label="Emergency wallet card preview"
    >
      {/* Header strip */}
      <div className="h-12 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <FaShieldAlt className="h-4 w-4" aria-hidden="true" />
          <span className="text-sm font-extrabold tracking-tight">LifeVault</span>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest text-red-100 bg-red-600/90 px-2 py-0.5 rounded">
          Emergency
        </span>
      </div>

      <div className="flex h-[calc(100%-3rem)] px-4 py-3 gap-3">
        {/* Left: identity */}
        <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
              In case of emergency
            </p>
            <p className="text-base font-extrabold text-slate-900 truncate mt-0.5 leading-tight">
              {name}
            </p>
            <p className="text-[10px] font-semibold text-slate-500 mt-1">
              Blood group:{' '}
              <span className="text-red-600 font-extrabold">{bloodLabel}</span>
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[7px] text-slate-400 leading-snug">
              Scan QR for allergies, medications &amp; emergency contacts.
            </p>
            {showUrl && emergencyUrl && (
              <p className="text-[6px] text-slate-400 break-all line-clamp-2 font-mono leading-tight">
                {emergencyUrl}
              </p>
            )}
          </div>
        </div>

        {/* Right: QR */}
        <div className="shrink-0 flex flex-col items-center justify-center">
          <div className="p-1.5 bg-white rounded-lg border border-slate-100 shadow-sm">
            {emergencyUrl ? (
              <QRCodeSVG
                value={emergencyUrl}
                size={88}
                level="H"
                includeMargin={false}
                bgColor="#ffffff"
                fgColor="#0f172a"
              />
            ) : (
              <div className="w-[88px] h-[88px] bg-slate-100 rounded" />
            )}
          </div>
          <p className="text-[7px] font-bold text-slate-400 mt-1 uppercase tracking-wide">
            Scan me
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletCard;
