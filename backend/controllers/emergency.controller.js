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
const { getIpGeolocation } = require('../utils/ipGeolocation');

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

    // Log scan asynchronously — don't block the response
    // Store a human-friendly location derived from IP (city/region).
    QRScan.create({
      userId: user._id,
      scannerIp: req.ip || 'Unknown',
      scannerCity: 'Unknown',
      scannerRegion: 'Unknown',
      scannerCountry: 'Unknown',
      scannerArea: 'Unknown',
      userAgent: req.headers['user-agent'] || 'Unknown',
    })
      .then(async (created) => {
        try {
          const geo = await getIpGeolocation(req.ip);
          if (!geo) return;

          created.scannerCity = geo.city || 'Unknown';
          created.scannerRegion = geo.regionName || 'Unknown';
          created.scannerCountry = geo.country || 'Unknown';
          created.scannerArea = geo.area || 'Unknown';
          await created.save();
        } catch {
          // Ignore geo lookup failures; the scan record still exists.
        }
      })
      .catch((err) => console.error('QR scan log failed:', err.message));

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
