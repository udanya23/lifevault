/**
 * controllers/medical.controller.js — Medical Info MVC Controller
 *
 * Implements:
 * - Retrieval of user medical profiles
 * - Creation and updates of medical lists (allergies, chronic diseases, medicines, notes)
 * - Automatic activity logger triggers for security auditing
 */

const MedicalInfo = require('../models/MedicalInfo');
const ActivityLog = require('../models/ActivityLog');
const ApiResponse = require('../utils/ApiResponse');

// ── Get Medical Info ─────────────────────────────────────────────────────────

exports.getMedicalInfo = async (req, res, next) => {
  const userId = req.user._id;

  try {
    let medical = await MedicalInfo.findOne({ userId });

    // If no record exists, return default empty structure to keep frontend clean
    if (!medical) {
      medical = {
        allergies: [],
        chronicDiseases: [],
        currentMedicines: [],
        medicalNotes: '',
      };
    }

    new ApiResponse(200, 'Medical information retrieved successfully', medical).send(res);
  } catch (error) {
    next(error);
  }
};

// ── Update Medical Info ──────────────────────────────────────────────────────

exports.updateMedicalInfo = async (req, res, next) => {
  const userId = req.user._id;
  const { allergies, chronicDiseases, currentMedicines, medicalNotes } = req.body;

  try {
    let medical = await MedicalInfo.findOne({ userId });

    if (!medical) {
      medical = new MedicalInfo({
        userId,
        allergies: allergies || [],
        chronicDiseases: chronicDiseases || [],
        currentMedicines: currentMedicines || [],
        medicalNotes: medicalNotes || '',
      });
    } else {
      medical.allergies = allergies !== undefined ? allergies : medical.allergies;
      medical.chronicDiseases = chronicDiseases !== undefined ? chronicDiseases : medical.chronicDiseases;
      medical.currentMedicines = currentMedicines !== undefined ? currentMedicines : medical.currentMedicines;
      medical.medicalNotes = medicalNotes !== undefined ? medicalNotes : medical.medicalNotes;
    }

    await medical.save();

    // Log the update operation in security logs
    await ActivityLog.create({
      userId,
      action: 'Medical Record Updated',
      description: 'Modified critical medical variables (allergies, medications, chronic illnesses).',
      ipAddress: req.ip || 'Unknown',
      userAgent: req.headers['user-agent'] || 'Unknown',
    });

    new ApiResponse(200, 'Medical information updated successfully', medical).send(res);
  } catch (error) {
    next(error);
  }
};
