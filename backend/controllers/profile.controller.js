/**
 * controllers/profile.controller.js — User Profile & Photo Managers
 *
 * Implements MVC logic for user profiles, profile photo updates (with
 * automatic Cloudinary cleanup), and security audit logs.
 */

const Profile = require('../models/Profile');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { deleteFromCloudinary } = require('../config/cloudinary');

// ── Get Profile ──────────────────────────────────────────────────────────────

exports.getProfile = async (req, res, next) => {
  const userId = req.user._id;

  try {
    let profile = await Profile.findOne({ userId });

    // If profile doesn't exist, return empty details to let frontend render forms
    if (!profile) {
      profile = {
        dob: null,
        gender: 'prefer_not_to_say',
        bloodGroup: 'unknown',
        height: null,
        weight: null,
        address: { street: '', city: '', state: '', pincode: '', country: '' },
        isOrganDonor: false,
      };
    }

    new ApiResponse(200, 'Profile retrieved successfully', profile).send(res);
  } catch (error) {
    next(error);
  }
};

// ── Create or Update Profile ──────────────────────────────────────────────────

exports.updateProfile = async (req, res, next) => {
  const userId = req.user._id;
  const { dob, gender, bloodGroup, height, weight, address, isOrganDonor } = req.body;

  try {
    // 1. Update or create the profile
    let profile = await Profile.findOne({ userId });

    if (!profile) {
      profile = new Profile({
        userId,
        dob,
        gender,
        bloodGroup,
        height,
        weight,
        address,
        isOrganDonor: isOrganDonor ?? false,
      });
    } else {
      profile.dob = dob !== undefined ? dob : profile.dob;
      profile.gender = gender !== undefined ? gender : profile.gender;
      profile.bloodGroup = bloodGroup !== undefined ? bloodGroup : profile.bloodGroup;
      profile.height = height !== undefined ? height : profile.height;
      profile.weight = weight !== undefined ? weight : profile.weight;
      profile.address = address !== undefined ? address : profile.address;
      profile.isOrganDonor = isOrganDonor !== undefined ? isOrganDonor : profile.isOrganDonor;
    }

    await profile.save();

    // 2. Log this action in security audit
    await ActivityLog.create({
      userId,
      action: 'Profile Updated',
      description: 'Modified medical profile details (DOB, gender, blood group, height, weight).',
      ipAddress: req.ip || 'Unknown',
      userAgent: req.headers['user-agent'] || 'Unknown',
    });

    new ApiResponse(200, 'Profile updated successfully', profile).send(res);
  } catch (error) {
    next(error);
  }
};

// ── Update Profile Photo ──────────────────────────────────────────────────────

exports.updateProfilePhoto = async (req, res, next) => {
  const userId = req.user._id;

  try {
    // 1. Ensure file was uploaded by multer
    if (!req.file) {
      return next(ApiError.badRequest('No image file provided.'));
    }

    const fileUrl = req.file.path; // Cloudinary URL
    const publicId = req.file.filename; // Cloudinary public_id

    // 2. Find user in database
    const user = await User.findById(userId);
    if (!user) {
      return next(ApiError.notFound('User not found.'));
    }

    // 3. Delete old profile photo from Cloudinary if it exists
    if (user.profilePhoto?.publicId) {
      await deleteFromCloudinary(user.profilePhoto.publicId, 'image');
    }

    // 4. Save new photo details to user record
    user.profilePhoto = {
      url: fileUrl,
      publicId: publicId,
    };
    await user.save();

    // 5. Log action in security audit
    await ActivityLog.create({
      userId,
      action: 'Avatar Updated',
      description: 'Uploaded a new profile photo to Cloudinary.',
      ipAddress: req.ip || 'Unknown',
      userAgent: req.headers['user-agent'] || 'Unknown',
    });

    new ApiResponse(200, 'Profile photo updated successfully', {
      profilePhoto: user.profilePhoto,
    }).send(res);
  } catch (error) {
    next(error);
  }
};
