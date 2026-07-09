/**
 * config/cloudinary.js — Cloudinary SDK configuration
 *
 * Cloudinary is used to:
 * 1. Store profile photos (in lifevault/profile-photos folder)
 * 2. Store uploaded documents (in lifevault/documents folder)
 *
 * We export both the configured `cloudinary` instance and
 * `CloudinaryStorage` for use with Multer in upload middleware.
 */

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

/**
 * Configure the Cloudinary SDK with credentials from environment variables.
 * This must be called before any upload operations.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Always use HTTPS for asset URLs
});

/**
 * Multer-Cloudinary storage for profile photos.
 *
 * - folder: Organizes uploads in Cloudinary dashboard
 * - allowed_formats: Whitelist — only images accepted
 * - transformation: Auto-optimize to WebP, resize to 400×400, fill crop
 *   This reduces storage and speeds up page loads significantly.
 */
const profilePhotoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lifevault/profile-photos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      {
        width: 400,
        height: 400,
        crop: 'fill',
        gravity: 'face',  // Smart face-detection crop
        quality: 'auto',
        fetch_format: 'auto', // Auto-convert to WebP for modern browsers
      },
    ],
  },
});

/**
 * Multer-Cloudinary storage for user documents (PDFs + images).
 *
 * - raw format is required for PDFs
 * - We store the public_id so we can delete files later
 */
const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    // PDFs must be stored as 'raw', images as 'image'
    const isPDF = file.mimetype === 'application/pdf';
    return {
      folder: 'lifevault/documents',
      resource_type: isPDF ? 'raw' : 'image',
      allowed_formats: isPDF ? ['pdf'] : ['jpg', 'jpeg', 'png', 'webp'],
      // Name the file with userId + timestamp for uniqueness
      public_id: `${req.user?.id}_${Date.now()}`,
    };
  },
});

/**
 * Delete a file from Cloudinary by its public_id.
 * Called when a user deletes a document or replaces their profile photo.
 *
 * @param {string} publicId     - The public_id stored in our DB
 * @param {string} resourceType - 'image' or 'raw' (for PDFs)
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    // Log but don't throw — deletion failure shouldn't block the user's request
    console.error('Cloudinary delete error:', error.message);
    return null;
  }
};

module.exports = {
  cloudinary,
  profilePhotoStorage,
  documentStorage,
  deleteFromCloudinary,
};
