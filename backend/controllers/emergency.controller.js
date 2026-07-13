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

    // Resolve location first (HTTPS providers), then save one complete scan record.
    // Keep this off the request critical path so the emergency page still loads fast.
    (async () => {
      try {
        const geo = await getIpGeolocation(scannerIp);
        await QRScan.create({
          userId: user._id,
          scannerIp,
          scannerCity: geo?.city || 'Unknown',
          scannerRegion: geo?.regionName || 'Unknown',
          scannerCountry: geo?.country || 'Unknown',
          scannerArea: geo?.area || 'Unknown',
          userAgent,
        });
      } catch (err) {
        console.error('QR scan log failed:', err.message);
      }
    })();

    // Strict field whitelist — only life-saving data
    const emergencyData = {
      name: user.name,
      bloodGroup: profile?.bloodGroup && profile.bloodGroup !== 'unknown'
        ? profile.bloodGroup
        : null,
      emergencyContacts: contacts.map((c) => ({
        name: c.name,
        relationship: c.relationship,
        phone: c.phone,
        isPrimary: c.isPrimary,
      })),
      allergies: medicalInfo?.allergies?.length ? medicalInfo.allergies : [],
      currentMedicines: medicalInfo?.currentMedicines?.length
        ? medicalInfo.currentMedicines
        : [],
    };

    new ApiResponse(200, 'Emergency information retrieved', emergencyData).send(res);
  } catch (error) {
    next(error);
  }
};
