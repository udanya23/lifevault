/**
 * controllers/emergencyContact.controller.js — Emergency Contacts Controller
 *
 * Implements MVC logic for emergency contacts:
 * - CRUD operations: create, get, update, delete
 * - Limits emergency contacts to 5 entries per account
 * - Custom security logs for modifications
 */

const EmergencyContact = require('../models/EmergencyContact');
const ActivityLog = require('../models/ActivityLog');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// ── Get All Contacts ─────────────────────────────────────────────────────────

exports.getContacts = async (req, res, next) => {
  const userId = req.user._id;

  try {
    const contacts = await EmergencyContact.find({ userId }).sort({ isPrimary: -1, createdAt: 1 });
    new ApiResponse(200, 'Emergency contacts retrieved successfully', contacts).send(res);
  } catch (error) {
    next(error);
  }
};

// ── Create Contact ────────────────────────────────────────────────────────────

exports.createContact = async (req, res, next) => {
  const userId = req.user._id;
  const { name, relationship, phone, isPrimary } = req.body;

  try {
    // 1. Enforce business limit: Max 5 emergency contacts per user
    const contactCount = await EmergencyContact.countDocuments({ userId });
    if (contactCount >= 5) {
      return next(
        ApiError.badRequest(
          'Maximum emergency contact limit (5) reached. Please delete one before adding another.'
        )
      );
    }

    // 2. Create contact (we will manually enforce single-primary after save)
    const contact = new EmergencyContact({
      userId,
      name,
      relationship,
      phone,
      isPrimary,
    });

    await contact.save();

    // 2b. If this contact is marked as primary, unset primary on all others
    if (contact.isPrimary) {
      await EmergencyContact.updateMany(
        { userId, _id: { $ne: contact._id } },
        { $set: { isPrimary: false } }
      );
    }

    // 3. Log action
    await ActivityLog.create({
      userId,
      action: 'Emergency Contact Created',
      description: `Added emergency contact: ${name} (${relationship}).`,
      ipAddress: req.ip || 'Unknown',
      userAgent: req.headers['user-agent'] || 'Unknown',
    });

    new ApiResponse(201, 'Emergency contact created successfully', contact).send(res);
  } catch (error) {
    next(error);
  }
};

// ── Update Contact ────────────────────────────────────────────────────────────

exports.updateContact = async (req, res, next) => {
  const userId = req.user._id;
  const { id } = req.params;
  const { name, relationship, phone, isPrimary } = req.body;

  try {
    // 1. Find contact and verify ownership
    const contact = await EmergencyContact.findOne({ _id: id, userId });
    if (!contact) {
      return next(ApiError.notFound('Emergency contact not found or unauthorized.'));
    }

    // 2. Modify properties
    contact.name = name !== undefined ? name : contact.name;
    contact.relationship = relationship !== undefined ? relationship : contact.relationship;
    contact.phone = phone !== undefined ? phone : contact.phone;
    contact.isPrimary = isPrimary !== undefined ? isPrimary : contact.isPrimary;

    await contact.save();

    // 2b. If this contact is now primary, unset primary on all others
    if (contact.isPrimary) {
      await EmergencyContact.updateMany(
        { userId, _id: { $ne: contact._id } },
        { $set: { isPrimary: false } }
      );
    }

    // 3. Log action
    await ActivityLog.create({
      userId,
      action: 'Emergency Contact Updated',
      description: `Modified emergency contact: ${contact.name} (${contact.relationship}).`,
      ipAddress: req.ip || 'Unknown',
      userAgent: req.headers['user-agent'] || 'Unknown',
    });

    new ApiResponse(200, 'Emergency contact updated successfully', contact).send(res);
  } catch (error) {
    next(error);
  }
};

// ── Delete Contact ────────────────────────────────────────────────────────────

exports.deleteContact = async (req, res, next) => {
  const userId = req.user._id;
  const { id } = req.params;

  try {
    // 1. Find and delete the contact ensuring ownership
    const contact = await EmergencyContact.findOne({ _id: id, userId });
    if (!contact) {
      return next(ApiError.notFound('Emergency contact not found or unauthorized.'));
    }

    await EmergencyContact.deleteOne({ _id: id });

    // 2. If deleted contact was primary, set another contact as primary (if exists)
    if (contact.isPrimary) {
      const remainingContact = await EmergencyContact.findOne({ userId });
      if (remainingContact) {
        remainingContact.isPrimary = true;
        await remainingContact.save();
      }
    }

    // 3. Log action
    await ActivityLog.create({
      userId,
      action: 'Emergency Contact Deleted',
      description: `Removed emergency contact: ${contact.name}.`,
      ipAddress: req.ip || 'Unknown',
      userAgent: req.headers['user-agent'] || 'Unknown',
    });

    new ApiResponse(200, 'Emergency contact deleted successfully').send(res);
  } catch (error) {
    next(error);
  }
};
