/**
 * models/HealthTimelineEvent.js — Health Timeline Event Schema
 *
 * Chronological health events with optional file attachments.
 * Supports soft delete and audit fields for production use.
 */

const mongoose = require('mongoose');
const { TIMELINE_CATEGORIES } = require('../utils/constants');

const attachmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    mimeType: { type: String, default: 'application/octet-stream' },
  },
  { _id: true, timestamps: false }
);

const healthTimelineEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date is required'],
      index: true,
    },
    eventType: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: Object.values(TIMELINE_CATEGORIES),
      index: true,
    },
    doctor: { type: String, trim: true, maxlength: 120 },
    hospital: { type: String, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 2000 },
    notes: { type: String, trim: true, maxlength: 4000 },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: { type: Date, default: null },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

healthTimelineEventSchema.index({ userId: 1, eventDate: -1 });
healthTimelineEventSchema.index({ userId: 1, category: 1, eventDate: -1 });
healthTimelineEventSchema.index(
  { userId: 1, description: 'text', doctor: 'text', hospital: 'text', notes: 'text' },
  { name: 'timeline_text_search' }
);

const HealthTimelineEvent = mongoose.model('HealthTimelineEvent', healthTimelineEventSchema);

module.exports = HealthTimelineEvent;
