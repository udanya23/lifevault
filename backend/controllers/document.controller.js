/**
 * controllers/document.controller.js — Secure Document Management
 *
 * Implements MVC logic for uploading, listing, and deleting secure vault documents.
 * Integrates with Cloudinary for file storage and deletes asset keys dynamically.
 */

const Document = require('../models/Document');
const ActivityLog = require('../models/ActivityLog');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { deleteFromCloudinary } = require('../config/cloudinary');

// ── Get All Documents ────────────────────────────────────────────────────────

exports.getDocuments = async (req, res, next) => {
  const userId = req.user._id;

  try {
    const documents = await Document.find({ userId }).sort({ createdAt: -1 });
    new ApiResponse(200, 'Documents retrieved successfully', documents).send(res);
  } catch (error) {
    next(error);
  }
};

// ── Upload Document ──────────────────────────────────────────────────────────

exports.uploadDocument = async (req, res, next) => {
  const userId = req.user._id;
  const { name, type } = req.body;

  try {
    // 1. Ensure file was uploaded by multer
    if (!req.file) {
      return next(ApiError.badRequest('No document file uploaded.'));
    }

    if (!name || !type) {
      // Cleanup Cloudinary file if inputs are invalid
      if (req.file.filename) {
        const isPDF = req.file.mimetype === 'application/pdf';
        await deleteFromCloudinary(req.file.filename, isPDF ? 'raw' : 'image');
      }
      return next(ApiError.badRequest('Document name and type are required.'));
    }

    const fileUrl = req.file.path; // Cloudinary URL
    const publicId = req.file.filename; // Cloudinary identifier

    // 2. Create Mongoose document record
    const document = new Document({
      userId,
      name,
      type,
      fileUrl,
      publicId,
    });

    await document.save();

    // 3. Log action in security audit log
    await ActivityLog.create({
      userId,
      action: 'Document Uploaded',
      description: `Uploaded document: ${name} (${type}).`,
      ipAddress: req.ip || 'Unknown',
      userAgent: req.headers['user-agent'] || 'Unknown',
    });

    new ApiResponse(201, 'Document uploaded successfully', document).send(res);
  } catch (error) {
    next(error);
  }
};

// ── Delete Document ──────────────────────────────────────────────────────────

exports.deleteDocument = async (req, res, next) => {
  const userId = req.user._id;
  const { id } = req.params;

  try {
    // 1. Find document and check ownership
    const document = await Document.findOne({ _id: id, userId });
    if (!document) {
      return next(ApiError.notFound('Document not found or unauthorized.'));
    }

    // 2. Determine resource type on Cloudinary
    // PDFs are stored as raw files on Cloudinary, images are stored as image types
    const isPDF = document.fileUrl.endsWith('.pdf');
    const resourceType = isPDF ? 'raw' : 'image';

    // Delete asset from Cloudinary storage
    await deleteFromCloudinary(document.publicId, resourceType);

    // 3. Delete Mongoose record
    await Document.deleteOne({ _id: id });

    // 4. Log action in security audit
    await ActivityLog.create({
      userId,
      action: 'Document Deleted',
      description: `Removed document: ${document.name}.`,
      ipAddress: req.ip || 'Unknown',
      userAgent: req.headers['user-agent'] || 'Unknown',
    });

    new ApiResponse(200, 'Document deleted successfully').send(res);
  } catch (error) {
    next(error);
  }
};
