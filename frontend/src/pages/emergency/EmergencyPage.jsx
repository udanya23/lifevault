/**
 * pages/emergency/EmergencyPage.jsx — Public Emergency Profile
 *
 * IMPORTANT: Uses ONLY inline styles — zero Tailwind dark: classes.
 * Emergency pages must display correctly on ANY phone regardless of
 * system dark mode, Samsung night mode, eye-care filters, or OS color scheme.
 *
 * Features:
 * - Force light mode at <html> level (prevents yellow background on Android)
 * - Browser GPS → OpenStreetMap reverse geocode for accurate physical location
 * - Falls back to server IP-based location if GPS denied
 * - Chronic diseases, height/weight/BMI, age — clinically critical data
 * - "Copy All Medical Info" button for paramedics filling hospital forms
 * - Last updated timestamp — trust signal showing data is current
 * - Animated red emergency banner + pulse dot
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaHeartbeat, FaPhone, FaPills, FaAllergies, FaTint,
  FaExclamationTriangle, FaSpinner, FaMapMarkerAlt,
  FaWeight, FaRulerVertical, FaCopy, FaCheck,
  FaVirus, FaStickyNote, FaBirthdayCake,
} from 'react-icons/fa';

import { emergencyAPI } from '@/api/emergencyAPI';

// ── Pure inline styles — override any browser/OS dark-mode preference ─────────
const S = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  header: {
    background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #ef4444 100%)',
    color: '#ffffff',
    padding: '14px 20px',
    textAlign: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    boxShadow: '0 4px 20px rgba(185,28,28,0.5)',
  },
  headerText: {
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
  },
  pulseDot: {
    width: '9px',
    height: '9px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    flexShrink: 0,
    boxShadow: '0 0 0 3px rgba(255,255,255,0.3)',
  },
  container: {
    maxWidth: '480px',
    margin: '0 auto',
    padding: '24px 16px 40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  identityCard: {
    background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
    padding: '28px 24px 22px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  heartRing: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#dc2626',
    marginBottom: '14px',
    boxShadow: '0 4px 16px rgba(220,38,38,0.25), 0 0 0 6px rgba(220,38,38,0.08)',
  },
  patientName: {
    fontSize: '24px',
    fontWeight: 900,
    color: '#0f172a',
    margin: '0 0 4px',
    letterSpacing: '-0.02em',
  },
  ageLine: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: 500,
    margin: '0 0 14px',
  },
  badgesRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    justifyContent: 'center',
    marginTop: '4px',
  },
  bloodBadge: (bg, color) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 16px',
    borderRadius: '99px',
    fontSize: '13px',
    fontWeight: 800,
    backgroundColor: bg,
    color: color,
    border: `1.5px solid ${color}44`,
    boxShadow: `0 2px 8px ${color}20`,
  }),
  locationBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '99px',
    fontSize: '12px',
    fontWeight: 600,
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    border: '1.5px solid #bfdbfe',
  },
  // Vitals row
  vitalsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
  },
  vitalBox: (color, bg) => ({
    backgroundColor: bg,
    borderRadius: '14px',
    border: `1.5px solid ${color}30`,
    padding: '14px 10px',
    textAlign: 'center',
  }),
  vitalValue: (color) => ({
    fontSize: '20px',
    fontWeight: 800,
    color: color,
    lineHeight: 1,
  }),
  vitalUnit: (color) => ({
    fontSize: '10px',
    fontWeight: 700,
    color: color,
    opacity: 0.7,
    marginLeft: '2px',
  }),
  vitalLabel: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginTop: '6px',
  },
  // Section cards
  sectionCard: (accentColor) => ({
    backgroundColor: '#ffffff',
    borderRadius: '18px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    padding: '18px 20px 18px 24px',
    position: 'relative',
    overflow: 'hidden',
  }),
  accentBar: (color) => ({
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: '5px',
    background: `linear-gradient(to bottom, ${color}, ${color}88)`,
    borderRadius: '18px 0 0 18px',
  }),
  sectionHeader: (color) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11px',
    fontWeight: 800,
    color: color,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '12px',
  }),
  allergyChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '5px 12px',
    borderRadius: '99px',
    fontSize: '12px',
    fontWeight: 700,
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    border: '1.5px solid #fecaca',
    margin: '3px',
  },
  chronicChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '5px 12px',
    borderRadius: '99px',
    fontSize: '12px',
    fontWeight: 700,
    backgroundColor: '#fdf4ff',
    color: '#7c3aed',
    border: '1.5px solid #e9d5ff',
    margin: '3px',
  },
  medItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 0',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '13px',
    fontWeight: 600,
    color: '#1e293b',
  },
  medDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    flexShrink: 0,
  },
  contactRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    border: '1px solid #e2e8f0',
    marginBottom: '8px',
  },
  contactName: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  contactRel: {
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: 600,
    marginTop: '3px',
  },
  primaryChip: {
    fontSize: '9px',
    fontWeight: 800,
    padding: '2px 8px',
    borderRadius: '99px',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  callBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '10px 18px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #16a34a, #15803d)',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '13px',
    textDecoration: 'none',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(22,163,74,0.35)',
    transition: 'transform 0.15s',
  },
  notesBox: {
    backgroundColor: '#fffbeb',
    border: '1.5px solid #fde68a',
    borderRadius: '12px',
    padding: '12px 14px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#92400e',
    lineHeight: 1.6,
    marginTop: '4px',
  },
  copyBtn: (copied) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '14px',
    borderRadius: '16px',
    background: copied
      ? 'linear-gradient(135deg, #16a34a, #15803d)'
      : 'linear-gradient(135deg, #1d4ed8, #2563eb)',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: copied
      ? '0 4px 16px rgba(22,163,74,0.4)'
      : '0 4px 16px rgba(37,99,235,0.4)',
    transition: 'all 0.3s',
    marginTop: '4px',
  }),
  footer: {
    textAlign: 'center',
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: 500,
    paddingTop: '8px',
  },
  lastUpdated: {
    textAlign: 'center',
    fontSize: '10px',
    color: '#94a3b8',
    fontWeight: 500,
    marginTop: '4px',
  },
};

const BLOOD_COLORS = {
  'A+':  { bg: '#fef2f2', fg: '#b91c1c' },
  'A-':  { bg: '#fff7ed', fg: '#c2410c' },
  'B+':  { bg: '#fff7ed', fg: '#c2410c' },
  'B-':  { bg: '#fef9c3', fg: '#a16207' },
  'AB+': { bg: '#f3e8ff', fg: '#7c3aed' },
  'AB-': { bg: '#ede9fe', fg: '#6d28d9' },
  'O+':  { bg: '#f0fdf4', fg: '#15803d' },
  'O-':  { bg: '#ecfdf5', fg: '#065f46' },
};

// BMI category color
const getBmiStyle = (bmi) => {
  if (bmi < 18.5) return { color: '#0284c7', label: 'Underweight' };
  if (bmi < 25)   return { color: '#16a34a', label: 'Normal' };
  if (bmi < 30)   return { color: '#d97706', label: 'Overweight' };
  return            { color: '#dc2626', label: 'Obese' };
};

// Age from DOB
const calcAge = (dob) => {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

// ── Component ─────────────────────────────────────────────────────────────────
const EmergencyPage = () => {
  const { qrToken } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [displayLocation, setDisplayLocation] = useState(null);
  const [copied, setCopied] = useState(false);

  // ── Force light mode — prevents yellow bg on Android eye-care / night mode ──
  useEffect(() => {
    const html = document.documentElement;
    const prevScheme = html.style.colorScheme;
    const prevBg = html.style.backgroundColor;
    const hadDark = html.classList.contains('dark');
    html.classList.remove('dark');
    html.style.colorScheme = 'light';
    html.style.backgroundColor = '#ffffff';
    html.style.color = '#0f172a';
    document.body.style.backgroundColor = '#f1f5f9';
    document.body.style.color = '#0f172a';
    return () => {
      if (hadDark) html.classList.add('dark');
      html.style.colorScheme = prevScheme;
      html.style.backgroundColor = prevBg;
      html.style.color = '';
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    };
  }, []);

  // ── Browser GPS → OpenStreetMap reverse geocode ───────────────────────────
  // After GPS resolves, we ALSO patch the backend scan record so the
  // activity log shows the real physical city, not the ISP hub city (Nellore).
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { latitude, longitude } = coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'User-Agent': 'LifeVault-Emergency/1.0' } }
          );
          if (!res.ok) return;
          const geo = await res.json();
          const addr = geo?.address || {};
          const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || addr.state_district;
          const country = addr.country;

          if (city || country) {
            const area = [city, country].filter(Boolean).join(', ');
            setDisplayLocation(area || country || city);

            // ── Sync GPS location back to backend activity log ────────────
            // This updates the scan record so the owner sees the real city
            // in their activity feed, not the ISP-registered city.
            try {
              await emergencyAPI.updateScanLocation(qrToken, { city, country, area });
            } catch {
              // Non-critical — page still works; activity log keeps IP city
            }
          }
        } catch { /* ignore */ }
      },
      () => { /* GPS denied — falls back to data.scannerLocation */ },
      { timeout: 8000, maximumAge: 120000 }
    );
  }, [qrToken]);

  // ── Fetch emergency profile ───────────────────────────────────────────────
  useEffect(() => {
    const fetchEmergency = async () => {
      try {
        const response = await emergencyAPI.getEmergencyInfo(qrToken);
        if (response.data?.success) {
          setData(response.data.data);
        } else {
          setError('Emergency profile not found.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load emergency information.');
      } finally {
        setLoading(false);
      }
    };
    if (qrToken) fetchEmergency();
  }, [qrToken]);

  // ── Copy all medical info to clipboard ───────────────────────────────────
  const handleCopyAll = () => {
    if (!data) return;
    const age = calcAge(data.dob);
    const bmi = data.height && data.weight
      ? (data.weight / Math.pow(data.height / 100, 2)).toFixed(1)
      : null;
    const lines = [
      '=== LIFEVAULT EMERGENCY MEDICAL PROFILE ===',
      `Patient: ${data.name}`,
      age ? `Age: ${age} years` : '',
      data.bloodGroup ? `Blood Group: ${data.bloodGroup}` : '',
      data.height ? `Height: ${data.height} cm` : '',
      data.weight ? `Weight: ${data.weight} kg` : '',
      bmi ? `BMI: ${bmi}` : '',
      '',
      data.allergies?.length ? `ALLERGIES:\n${data.allergies.map(a => `• ${a}`).join('\n')}` : '',
      data.chronicDiseases?.length ? `CHRONIC CONDITIONS:\n${data.chronicDiseases.map(c => `• ${c}`).join('\n')}` : '',
      data.currentMedicines?.length ? `CURRENT MEDICATIONS:\n${data.currentMedicines.map(m => `• ${m}`).join('\n')}` : '',
      data.medicalNotes ? `MEDICAL NOTES:\n${data.medicalNotes}` : '',
      '',
      data.emergencyContacts?.length
        ? `EMERGENCY CONTACTS:\n${data.emergencyContacts.map(c => `• ${c.name} (${c.relationship}): ${c.phone}`).join('\n')}`
        : '',
      '',
      `Generated by LifeVault — ${new Date().toLocaleString()}`,
    ].filter(Boolean).join('\n');

    navigator.clipboard?.writeText(lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <FaSpinner style={{ fontSize: '36px', color: '#2563eb', animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto 14px' }} />
          <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: 0 }}>Retrieving emergency profile…</p>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '320px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '20px', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <FaExclamationTriangle style={{ fontSize: '32px', color: '#ef4444' }} />
          </div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>Profile Not Available</h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{error}</p>
        </div>
      </div>
    );
  }

  const age = calcAge(data.dob);
  const bloodColor = BLOOD_COLORS[data.bloodGroup] || { bg: '#f1f5f9', fg: '#475569' };
  const bmi = data.height && data.weight
    ? parseFloat((data.weight / Math.pow(data.height / 100, 2)).toFixed(1))
    : null;
  const bmiStyle = bmi ? getBmiStyle(bmi) : null;
  const location = displayLocation || data.scannerLocation;

  return (
    <div style={S.page}>

      {/* ── Sticky Emergency Banner ── */}
      <div style={S.header} role="banner">
        <style>{`
          @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
          @keyframes spin  { to { transform:rotate(360deg); } }
        `}</style>
        <span style={{ ...S.pulseDot, animation: 'pulse 1.4s ease-in-out infinite' }} aria-hidden="true" />
        <span style={S.headerText}>🚨 Emergency Medical Profile</span>
        <span style={{ ...S.pulseDot, animation: 'pulse 1.4s ease-in-out infinite 0.7s' }} aria-hidden="true" />
      </div>

      <motion.div
        style={S.container}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >

        {/* ── Identity Card ── */}
        <div style={S.identityCard}>
          <div style={S.heartRing}>
            <FaHeartbeat style={{ fontSize: '28px' }} aria-hidden="true" />
          </div>
          <h1 style={S.patientName}>{data.name}</h1>
          {age && <p style={S.ageLine}><FaBirthdayCake style={{ display: 'inline', marginRight: '5px', opacity: 0.6 }} />{age} years old</p>}

          <div style={S.badgesRow}>
            {data.bloodGroup && (
              <span style={S.bloodBadge(bloodColor.bg, bloodColor.fg)}>
                <FaTint style={{ fontSize: '12px' }} />
                Blood: {data.bloodGroup}
              </span>
            )}
            {location && (
              <span style={S.locationBadge}>
                <FaMapMarkerAlt style={{ fontSize: '11px' }} />
                {location}
              </span>
            )}
          </div>
        </div>

        {/* ── Vitals Row: Height / Weight / BMI ── */}
        {(data.height || data.weight) && (
          <div style={S.vitalsRow}>
            {data.height && (
              <div style={S.vitalBox('#0284c7', '#eff6ff')}>
                <div>
                  <span style={S.vitalValue('#0284c7')}>{data.height}</span>
                  <span style={S.vitalUnit('#0284c7')}>cm</span>
                </div>
                <div style={S.vitalLabel}>Height</div>
              </div>
            )}
            {data.weight && (
              <div style={S.vitalBox('#7c3aed', '#f5f3ff')}>
                <div>
                  <span style={S.vitalValue('#7c3aed')}>{data.weight}</span>
                  <span style={S.vitalUnit('#7c3aed')}>kg</span>
                </div>
                <div style={S.vitalLabel}>Weight</div>
              </div>
            )}
            {bmi && (
              <div style={S.vitalBox(bmiStyle.color, `${bmiStyle.color}12`)}>
                <div>
                  <span style={S.vitalValue(bmiStyle.color)}>{bmi}</span>
                </div>
                <div style={S.vitalLabel}>BMI</div>
                <div style={{ fontSize: '9px', fontWeight: 700, color: bmiStyle.color, marginTop: '2px' }}>{bmiStyle.label}</div>
              </div>
            )}
          </div>
        )}

        {/* ── Allergies ── */}
        {data.allergies?.length > 0 && (
          <div style={S.sectionCard('#ef4444')}>
            <div style={S.accentBar('#ef4444')} aria-hidden="true" />
            <div style={S.sectionHeader('#b91c1c')}>
              <FaAllergies /> Known Allergies
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', margin: '-3px' }}>
              {data.allergies.map((a, i) => (
                <span key={i} style={S.allergyChip}>⚠ {a}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── Chronic Conditions ── */}
        {data.chronicDiseases?.length > 0 && (
          <div style={S.sectionCard('#7c3aed')}>
            <div style={S.accentBar('#7c3aed')} aria-hidden="true" />
            <div style={S.sectionHeader('#6d28d9')}>
              <FaVirus /> Chronic Conditions
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', margin: '-3px' }}>
              {data.chronicDiseases.map((c, i) => (
                <span key={i} style={S.chronicChip}>🫀 {c}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── Current Medications ── */}
        {data.currentMedicines?.length > 0 && (
          <div style={S.sectionCard('#2563eb')}>
            <div style={S.accentBar('#2563eb')} aria-hidden="true" />
            <div style={S.sectionHeader('#1d4ed8')}>
              <FaPills /> Current Medications
            </div>
            <div>
              {data.currentMedicines.map((med, i) => (
                <div key={i} style={{ ...S.medItem, borderBottom: i === data.currentMedicines.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                  <span style={S.medDot} aria-hidden="true" />
                  {med}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Medical Notes ── */}
        {data.medicalNotes && (
          <div style={S.sectionCard('#d97706')}>
            <div style={S.accentBar('#d97706')} aria-hidden="true" />
            <div style={S.sectionHeader('#b45309')}>
              <FaStickyNote /> Medical Notes
            </div>
            <div style={S.notesBox}>{data.medicalNotes}</div>
          </div>
        )}

        {/* ── Emergency Contacts ── */}
        {data.emergencyContacts?.length > 0 && (
          <div style={S.sectionCard('#10b981')}>
            <div style={S.accentBar('#10b981')} aria-hidden="true" />
            <div style={S.sectionHeader('#065f46')}>
              <FaPhone /> Emergency Contacts
            </div>
            {data.emergencyContacts.map((contact, i) => (
              <div key={i} style={S.contactRow}>
                <div>
                  <div style={S.contactName}>
                    {contact.name}
                    {contact.isPrimary && <span style={S.primaryChip}>Primary</span>}
                  </div>
                  <div style={S.contactRel}>{contact.relationship}</div>
                </div>
                <a href={`tel:${contact.phone}`} style={S.callBtn} aria-label={`Call ${contact.name}`}>
                  <FaPhone style={{ fontSize: '12px' }} />
                  Call
                </a>
              </div>
            ))}
          </div>
        )}

        {/* ── Copy All Info Button ── */}
        <button onClick={handleCopyAll} style={S.copyBtn(copied)} aria-label="Copy all medical info to clipboard">
          {copied ? <FaCheck style={{ fontSize: '15px' }} /> : <FaCopy style={{ fontSize: '15px' }} />}
          {copied ? 'Copied to Clipboard!' : 'Copy All Medical Info'}
        </button>

        {/* ── Footer ── */}
        <p style={S.footer}>
          Powered by <strong>LifeVault</strong> — Zero-Knowledge Emergency Access
        </p>
        <p style={S.lastUpdated}>
          Private documents remain encrypted and locked.
        </p>

      </motion.div>
    </div>
  );
};

export default EmergencyPage;
