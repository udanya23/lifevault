/**
 * models/QRScan.js — QR Scan Analytics
 *
 * Tracks individual scans of a user's QR code.
 */

const mongoose = require('mongoose');

const qrScanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    scannerIp: {
      type: String,
      default: 'Unknown',
    },
    scannerCity: {
      type: String,
      default: 'Unknown',
    },
    scannerRegion: {
      type: String,
      default: 'Unknown',
    },
    scannerCountry: {
      type: String,
      default: 'Unknown',
    },
    // Human-friendly field shown in UI (e.g., "Mumbai, Maharashtra, India")
    scannerArea: {
      type: String,
      default: 'Unknown',
    },
    userAgent: {
      type: String,
      default: 'Unknown',
    },
    scannedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // scannedAt replaces createdAt
  }
);

const QRScan = mongoose.model('QRScan', qrScanSchema);

module.exports = QRScan;
