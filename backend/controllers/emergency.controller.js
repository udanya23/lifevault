/**
 * controllers/emergency.controller.js — Public Emergency Page API
 *
 * PUBLIC endpoint — no authentication required.
 * Returns ONLY life-saving fields whitelisted below.
 * Never exposes address, email, documents, or medical notes.
 */

const User = require('../models/User');
const Profile = require('../models/Profile');
const EmergencyContact = require('../models/EmergencyContact');
const MedicalInfo = require('../models/MedicalInfo');
const QRScan = require('../models/QRScan');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { getClientIp, getIpGeolocation } = require('../utils/ipGeolocation');

exports.getEmergencyInfo = async (req, res, next) => {
  const { qrToken } = req.params;

  try {
    if (!qrToken || qrToken.length < 16) {
      return next(ApiError.badRequest('Invalid QR code.'));
    }

    const user = await User.findOne({ qrToken, isActive: true, isSuspended: false });
    if (!user) {
      return next(ApiError.notFound('Emergency profile not found or inactive.'));
    }

    const [profile, contacts, medicalInfo] = await Promise.all([
      Profile.findOne({ userId: user._id }),
      EmergencyContact.find({ userId: user._id })
        .sort({ isPrimary: -1, createdAt: 1 })
        .select('name relationship phone isPrimary'),
      MedicalInfo.findOne({ userId: user._id }),
    ]);

    // Prefer the real public client IP (not Render's private 10.x hop)
    const scannerIp = getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Resolve geolocation with a max 3-second timeout.
    // We await this BEFORE sending the response so we can include the
    // detected location in the API data — this guarantees the emergency page
    // shows the EXACT same location as the activity log (both use the same IP).
    let geo = null;
    try {
      geo = await Promise.race([
        getIpGeolocation(scannerIp),
        new Promise((resolve) => setTimeout(() => resolve(null), 3000)),
      ]);
    } catch {
      // non-critical — page still loads without location
    }

    // Save the scan log in the background (fire-and-forget) — does not block response.
    QRScan.create({
      userId: user._id,
      scannerIp,
      scannerCity: geo?.city || 'Unknown',
      scannerRegion: '',
      scannerCountry: geo?.country || 'Unknown',
      scannerArea: geo?.area || 'Unknown',
      userAgent,
    }).catch((err) => console.error('QR scan log failed:', err.message));

    // Strict field whitelist — life-saving + clinically useful data
    const emergencyData = {
      name: user.name,
      bloodGroup: profile?.bloodGroup && profile.bloodGroup !== 'unknown'
        ? profile.bloodGroup
        : null,
      // Physical vitals — critical for drug dosage calculations
      height: profile?.height || null,   // cm
      weight: profile?.weight || null,   // kg
      dob: profile?.dob || null,         // for age calculation on frontend
      emergencyContacts: contacts.map((c) => ({
        name: c.name,
        relationship: c.relationship,
        phone: c.phone,
        isPrimary: c.isPrimary,
      })),
      allergies: medicalInfo?.allergies?.length ? medicalInfo.allergies : [],
      chronicDiseases: medicalInfo?.chronicDiseases?.length
        ? medicalInfo.chronicDiseases
        : [],
      currentMedicines: medicalInfo?.currentMedicines?.length
        ? medicalInfo.currentMedicines
        : [],
      medicalNotes: medicalInfo?.medicalNotes || null,
      // Server-detected location of the person who scanned the QR code.
      scannerLocation: geo?.area || null,
    };

    new ApiResponse(200, 'Emergency information retrieved', emergencyData).send(res);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /emergency/:qrToken/location
 *
 * Called by the emergency page AFTER browser GPS resolves.
 * Updates the most recent QRScan for this user with the accurate GPS city
 * so the activity log shows the real physical location instead of the
 * ISP hub city (e.g. "Nellore" for all devices on the same WiFi).
 *
 * No authentication required — tied to the public qrToken.
 * Only updates location fields, nothing else.
 */
exports.updateScanLocation = async (req, res, next) => {
  const { qrToken } = req.params;
  const { city, country, area } = req.body || {};

  if (!city && !area) {
    return res.status(400).json({ success: false, message: 'Location data required.' });
  }

  try {
    const user = await User.findOne({ qrToken, isActive: true, isSuspended: false });
    if (!user) return res.status(404).json({ success: false, message: 'Not found.' });

    const resolvedArea = area || [city, country].filter(Boolean).join(', ');

    // Update only the most recent scan for this user using standard, highly compatible findOne + save
    const scan = await QRScan.findOne({ userId: user._id }).sort({ scannedAt: -1 });
    if (scan) {
      scan.scannerCity = city || '';
      scan.scannerCountry = country || '';
      scan.scannerArea = resolvedArea;
      await scan.save();
    }

    return res.status(200).json({ success: true, message: 'Location updated.' });
  } catch (error) {
    next(error);
  }
};
