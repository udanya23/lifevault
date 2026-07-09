/**
 * models/EmergencyContact.js — Emergency Contact Schema
 *
 * Stores next-of-kin contacts for users. Responders access this list
 * in case of a critical scan trigger.
 */

const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true,
    },
    relationship: {
      type: String,
      required: [true, 'Relationship is required (e.g. Spouse, Father)'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const EmergencyContact = mongoose.model(
  'EmergencyContact',
  emergencyContactSchema
);

module.exports = EmergencyContact;
