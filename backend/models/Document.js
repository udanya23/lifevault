/**
 * models/Document.js — Secure Vault Document Schema
 *
 * Stores references to uploaded health records, insurance documents, etc.
 */

const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Document type is required'],
      enum: [
        'aadhaar',
        'pan',
        'passport',
        'drivingLicense',
        'insurance',
        'medicalReport',
        'other',
      ],
      default: 'other',
    },
    name: {
      type: String,
      required: [true, 'Document name is required'],
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    publicId: {
      type: String, // Cloudinary identifier used for file deletions
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
