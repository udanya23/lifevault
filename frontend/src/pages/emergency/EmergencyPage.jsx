/**
 * pages/emergency/EmergencyPage.jsx — Public Emergency Profile
 *
 * IMPORTANT: This page uses ONLY inline styles — zero Tailwind dark: classes.
 * This is intentional: emergency pages must display correctly on ANY phone,
 * regardless of system dark mode, Samsung browser night mode, eye-care filters,
 * or any OS-level color scheme preference.
 *
 * Features:
 * - Force light mode at the <html> level via useEffect
 * - All backgrounds/colors hardcoded via inline styles (cannot be overridden)
 * - Live IP geolocation: shows visitor city + country via ipapi.co
 * - Premium animated red emergency header
 * - Responsive medical cards: allergies, medications, emergency contacts
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaHeartbeat,
  FaPhone,
  FaPills,
  FaAllergies,
  FaTint,
  FaExclamationTriangle,
  FaSpinner,
  FaMapMarkerAlt,
} from 'react-icons/fa';

import { emergencyAPI } from '@/api/emergencyAPI';

// ── Inline style constants — override everything ──────────────────────────────
const S = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  header: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    padding: '12px 16px',
    textAlign: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxShadow: '0 2px 8px rgba(220,38,38,0.4)',
  },
  headerText: {
    fontSize: '11px',
    fontWeight: 800,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
  pulseDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    flexShrink: 0,
  },
  container: {
    maxWidth: '440px',
    margin: '0 auto',
    padding: '28px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)',
    padding: '20px',
  },
  identityCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
    padding: '24px 20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  heartIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#fef2f2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ef4444',
    marginBottom: '12px',
    boxShadow: '0 2px 12px rgba(239,68,68,0.2)',
  },
  patientName: {
    fontSize: '22px',
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
  },
  bloodBadge: (bg, color) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 14px',
    borderRadius: '99px',
    fontSize: '12px',
    fontWeight: 800,
    marginTop: '12px',
    backgroundColor: bg,
    color: color,
    border: `1px solid ${color}33`,
  }),
  locationBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    borderRadius: '99px',
    fontSize: '11px',
    fontWeight: 600,
    marginTop: '8px',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
  },
  sectionAccentCard: (accentColor) => ({
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    padding: '18px 18px 18px 22px',
    position: 'relative',
    overflow: 'hidden',
  }),
  accentBar: (color) => ({
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '4px',
    backgroundColor: color,
    borderRadius: '16px 0 0 16px',
  }),
  sectionTitle: (color) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11px',
    fontWeight: 800,
    color: color,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '12px',
  }),
  allergyBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '99px',
    fontSize: '12px',
    fontWeight: 700,
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    margin: '3px',
  },
  medItem: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#334155',
    padding: '6px 0 6px 12px',
    borderLeft: '2px solid #93c5fd',
    marginBottom: '6px',
  },
  contactRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    marginBottom: '8px',
  },
  contactName: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
  },
  contactRel: {
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: 600,
    marginTop: '2px',
  },
  primaryBadge: {
    fontSize: '9px',
    fontWeight: 800,
    padding: '2px 7px',
    borderRadius: '99px',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  callBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '10px',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '12px',
    textDecoration: 'none',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
  },
  footer: {
    textAlign: 'center',
    fontSize: '10px',
    color: '#94a3b8',
    fontWeight: 600,
    paddingTop: '8px',
    paddingBottom: '16px',
  },
};

// Blood group colors (inline, not Tailwind classes)
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

// ── Component ─────────────────────────────────────────────────────────────────

const EmergencyPage = () => {
  const { qrToken } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [displayLocation, setDisplayLocation] = useState(null);

  // ── Lock the entire page to light mode ──────────────────────────────────────
  useEffect(() => {
    const html = document.documentElement;
    const prevColorScheme = html.style.colorScheme;
    const prevBg = html.style.backgroundColor;
    const hadDark = html.classList.contains('dark');

    html.classList.remove('dark');
    html.style.colorScheme = 'light';
    html.style.backgroundColor = '#ffffff';
    html.style.color = '#0f172a';
    document.body.style.backgroundColor = '#f8fafc';
    document.body.style.color = '#0f172a';

    return () => {
      if (hadDark) html.classList.add('dark');
      html.style.colorScheme = prevColorScheme;
      html.style.backgroundColor = prevBg;
      html.style.color = '';
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    };
  }, []);

  // ── GPS Location (most accurate — actual physical city, not ISP hub city) ────
  // Root cause of "always shows Nellore": all phones on your network share the same
  // public IP (223.185.49.74) which your ISP registered to Nellore.
  // IP geolocation will ALWAYS return Nellore for that IP regardless of device.
  // Browser GPS gives the real physical location of whoever is holding the phone.
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
          // Nominatim returns varying levels of detail — pick the most specific available
          const city =
            addr.city ||
            addr.town ||
            addr.village ||
            addr.suburb ||
            addr.county ||
            addr.state_district;
          const country = addr.country;
          if (city && country) setDisplayLocation(`${city}, ${country}`);
          else if (city) setDisplayLocation(city);
          else if (country) setDisplayLocation(country);
        } catch {
          // GPS worked but reverse-geocoding failed — fall through to IP fallback
        }
      },
      () => {
        // GPS denied or unavailable — displayLocation will remain null and
        // the badge will show data.scannerLocation (IP-based) as fallback below
      },
      { timeout: 8000, maximumAge: 120000 }
    );
  }, []);

  // ── Fetch emergency profile ──────────────────────────────────────────────────
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
        setError(
          err.response?.data?.message || 'Unable to load emergency information.'
        );
      } finally {
        setLoading(false);
      }
    };
    if (qrToken) fetchEmergency();
  }, [qrToken]);

  // ── Loading State ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <FaSpinner
            style={{ fontSize: '36px', color: '#2563eb', animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto 12px' }}
            aria-hidden="true"
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: 0 }}>
            Retrieving emergency profile…
          </p>
        </div>
      </div>
    );
  }

  // ── Error State ──────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{ textAlign: 'center', maxWidth: '320px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <FaExclamationTriangle style={{ fontSize: '28px', color: '#ef4444' }} aria-hidden="true" />
          </div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
            Profile Not Available
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{error}</p>
        </div>
      </div>
    );
  }

  const bloodColor = BLOOD_COLORS[data.bloodGroup] || { bg: '#f1f5f9', fg: '#475569' };

  // ── Main Render ──────────────────────────────────────────────────────────────
  return (
    <div style={S.page}>

      {/* ── Sticky Emergency Banner ── */}
      <div style={S.header} role="banner">
        <span style={{ ...S.pulseDot, animation: 'pulse 1.5s ease-in-out infinite' }} aria-hidden="true" />
        <style>{`
          @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.85)} }
          @keyframes spin  { to { transform: rotate(360deg); } }
        `}</style>
        <span style={S.headerText}>🚨 Emergency Medical Profile</span>
      </div>

      <motion.div
        style={S.container}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >

        {/* ── Patient Identity Card ── */}
        <div style={S.identityCard}>
          <div style={S.heartIcon}>
            <FaHeartbeat style={{ fontSize: '22px' }} aria-hidden="true" />
          </div>
          <h1 style={S.patientName}>{data.name}</h1>

          {data.bloodGroup && (
            <span style={S.bloodBadge(bloodColor.bg, bloodColor.fg)}>
              <FaTint style={{ fontSize: '12px' }} aria-hidden="true" />
              Blood Group: {data.bloodGroup}
            </span>
          )}

          {/* Location Badge: GPS city (accurate) → IP city (ISP fallback) */}
          {(displayLocation || data.scannerLocation) && (
            <span style={S.locationBadge}>
              <FaMapMarkerAlt style={{ fontSize: '11px' }} aria-hidden="true" />
              Scanned from: {displayLocation || data.scannerLocation}
            </span>
          )}
        </div>

        {/* ── Allergies ── */}
        {data.allergies?.length > 0 && (
          <div style={S.sectionAccentCard('#ef4444')}>
            <div style={S.accentBar('#ef4444')} aria-hidden="true" />
            <div style={S.sectionTitle('#b91c1c')}>
              <FaAllergies aria-hidden="true" />
              Known Allergies
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {data.allergies.map((allergy, i) => (
                <span key={i} style={S.allergyBadge}>{allergy}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── Current Medications ── */}
        {data.currentMedicines?.length > 0 && (
          <div style={S.sectionAccentCard('#3b82f6')}>
            <div style={S.accentBar('#3b82f6')} aria-hidden="true" />
            <div style={S.sectionTitle('#1d4ed8')}>
              <FaPills aria-hidden="true" />
              Current Medications
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {data.currentMedicines.map((med, i) => (
                <li key={i} style={S.medItem}>{med}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Emergency Contacts ── */}
        {data.emergencyContacts?.length > 0 && (
          <div style={S.sectionAccentCard('#10b981')}>
            <div style={S.accentBar('#10b981')} aria-hidden="true" />
            <div style={S.sectionTitle('#065f46')}>
              <FaPhone aria-hidden="true" />
              Next-of-Kin Contacts
            </div>
            {data.emergencyContacts.map((contact, i) => (
              <div key={i} style={S.contactRow}>
                <div>
                  <div style={S.contactName}>
                    {contact.name}
                    {contact.isPrimary && (
                      <span style={S.primaryBadge}>Primary</span>
                    )}
                  </div>
                  <div style={S.contactRel}>{contact.relationship}</div>
                </div>
                <a href={`tel:${contact.phone}`} style={S.callBtn} aria-label={`Call ${contact.name}`}>
                  <FaPhone style={{ fontSize: '11px' }} aria-hidden="true" />
                  Call
                </a>
              </div>
            ))}
          </div>
        )}

        {/* ── Footer ── */}
        <p style={S.footer}>
          Powered by LifeVault — Zero-Knowledge Emergency Access.<br />
          Private documents remain locked.
        </p>

      </motion.div>
    </div>
  );
};

export default EmergencyPage;
