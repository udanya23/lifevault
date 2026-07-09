/**
 * models/MedicalInfo.js — Critical Medical Information Schema
 *
 * Stores allergies, chronic illnesses, medications, and general first aid notes.
 */

const mongoose = require('mongoose');

const medicalInfoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    allergies: {
      type: [String],
      default: [],
    },
    chronicDiseases: {
      type: [String],
      default: [],
    },
    currentMedicines: {
      type: [String],
      default: [],
    },
    medicalNotes: {
      type: String,
      trim: true,
      maxlength: [500, 'Medical notes cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const MedicalInfo = mongoose.model('MedicalInfo', medicalInfoSchema);

module.exports = MedicalInfo;
