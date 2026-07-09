/**
 * services/admin.service.js — Admin Business Logic
 *
 * Handles cascade deletion of user data including Cloudinary assets.
 * Keeps controllers thin and reusable.
 */

const User = require('../models/User');
const Profile = require('../models/Profile');
const MedicalInfo = require('../models/MedicalInfo');
const EmergencyContact = require('../models/EmergencyContact');
const Document = require('../models/Document');
const ActivityLog = require('../models/ActivityLog');
const QRScan = require('../models/QRScan');
const { deleteFromCloudinary } = require('../config/cloudinary');

/**
 * Permanently delete a user and all associated vault data.
 * @param {string} userId
 */
const deleteUserAndData = async (userId) => {
  const [documents, user] = await Promise.all([
    Document.find({ userId }),
    User.findById(userId),
  ]);

  // Remove Cloudinary assets for documents
  for (const doc of documents) {
    const isPDF = doc.fileUrl?.endsWith('.pdf');
    await deleteFromCloudinary(doc.publicId, isPDF ? 'raw' : 'image');
  }

  // Remove profile photo from Cloudinary
  if (user?.profilePhoto?.publicId) {
    await deleteFromCloudinary(user.profilePhoto.publicId, 'image');
  }

  await Promise.all([
    Document.deleteMany({ userId }),
    Profile.deleteMany({ userId }),
    MedicalInfo.deleteMany({ userId }),
    EmergencyContact.deleteMany({ userId }),
    ActivityLog.deleteMany({ userId }),
    QRScan.deleteMany({ userId }),
    User.deleteOne({ _id: userId }),
  ]);
};

module.exports = { deleteUserAndData };
