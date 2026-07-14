/**
 * controllers/dashboard.controller.js — Dashboard Data Aggregation
 *
 * Implements MERN SaaS business logic:
 * - Dynamic profile completion calculation (User, Profile, Medical, Contacts, Docs)
 * - Numeric statistics (document count, contact counts, QR scans)
 * - Activity log & QR scan history collection
 * - Handles missing/empty models gracefully
 */

const Profile = require('../models/Profile');
const MedicalInfo = require('../models/MedicalInfo');
const EmergencyContact = require('../models/EmergencyContact');
const Document = require('../models/Document');
const ActivityLog = require('../models/ActivityLog');
const QRScan = require('../models/QRScan');
const ApiResponse = require('../utils/ApiResponse');

exports.getDashboardData = async (req, res, next) => {
  const userId = req.user._id;

  try {
    // 1. Fetch user specific items concurrently to optimize speed
    const [profile, medicalInfo, contactsCount, documentsCount, scansCount, recentScans, recentLogs] =
      await Promise.all([
        Profile.findOne({ userId }),
        MedicalInfo.findOne({ userId }),
        EmergencyContact.countDocuments({ userId }),
        Document.countDocuments({ userId }),
        QRScan.countDocuments({ userId }),
        QRScan.find({ userId }).sort({ scannedAt: -1 }).limit(5),
        ActivityLog.find({ userId }).sort({ createdAt: -1 }).limit(5),
      ]);

    // 2. Calculate dynamic Profile Completion Percentage
    let completion = 20; // 20% for registration (always true at this stage)

    if (profile) {
      // Award up to 25% for profile details
      let profilePoints = 0;
      if (profile.dob) profilePoints += 5;
      if (profile.gender && profile.gender !== 'prefer_not_to_say') profilePoints += 5;
      if (profile.bloodGroup && profile.bloodGroup !== 'unknown') profilePoints += 5;
      if (profile.height || profile.weight) profilePoints += 5;
      if (profile.address?.city || profile.address?.country) profilePoints += 5;
      completion += profilePoints;
    }

    if (medicalInfo) {
      // Award up to 25% for medical details
      let medicalPoints = 10; // 10% just for creating the sheet
      if (medicalInfo.allergies && medicalInfo.allergies.length > 0) medicalPoints += 5;
      if (medicalInfo.chronicDiseases && medicalInfo.chronicDiseases.length > 0) medicalPoints += 5;
      if (medicalInfo.currentMedicines && medicalInfo.currentMedicines.length > 0) medicalPoints += 5;
      completion += medicalPoints;
    }

    if (contactsCount > 0) {
      completion += 20; // 20% for having at least 1 emergency contact
    }

    if (documentsCount > 0) {
      completion += 10; // 10% for uploading at least 1 file
    }

    // Cap at 100
    completion = Math.min(completion, 100);

    // 3. Assemble stats object
    const stats = {
      contactsCount,
      documentsCount,
      scansCount,
      profileCompletion: completion,
      // Extended stats for VaultHealthScore widget
      bloodGroup: profile?.bloodGroup || null,
      allergiesCount: medicalInfo?.allergies?.length || 0,
      medicinesCount: medicalInfo?.currentMedicines?.length || 0,
      chronicCount: medicalInfo?.chronicDiseases?.length || 0,
      height: profile?.height || null,
      weight: profile?.weight || null,
    };

    // 4. Return success response
    new ApiResponse(200, 'Dashboard telemetry aggregated successfully', {
      stats,
      recentScans,
      recentLogs,
    }).send(res);
  } catch (error) {
    next(error);
  }
};
