/**
 * controllers/timeline.controller.js — Health Timeline CRUD
 *
 * Paginated list with year/category/search filters, soft delete,
 * and Cloudinary-backed file attachments.
 */

const HealthTimelineEvent = require('../models/HealthTimelineEvent');
const ActivityLog = require('../models/ActivityLog');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { PAGINATION } = require('../utils/constants');
const { deleteFromCloudinary } = require('../config/cloudinary');

const buildListFilter = (userId, { year, category, search }) => {
  const filter = { userId, isDeleted: false };

  if (category) filter.category = category;

  if (year) {
    const y = parseInt(year, 10);
    filter.eventDate = {
      $gte: new Date(`${y}-01-01T00:00:00.000Z`),
      $lte: new Date(`${y}-12-31T23:59:59.999Z`),
    };
  }

  if (search && search.trim()) {
    const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [
      { description: regex },
      { doctor: regex },
      { hospital: regex },
      { notes: regex },
      { eventType: regex },
    ];
  }

  return filter;
};

const mapUploadedFiles = (files = []) =>
  files.map((file) => ({
    name: file.originalname || 'Attachment',
    fileUrl: file.path,
    publicId: file.filename,
    mimeType: file.mimetype || 'application/octet-stream',
  }));

const cleanupUploadedFiles = async (files = []) => {
  for (const file of files) {
    if (!file?.filename) continue;
    const isPDF = file.mimetype === 'application/pdf';
    await deleteFromCloudinary(file.filename, isPDF ? 'raw' : 'image');
  }
};

const logActivity = async (req, action, description) => {
  await ActivityLog.create({
    userId: req.user._id,
    action,
    description,
    ipAddress: req.ip || 'Unknown',
    userAgent: req.headers['user-agent'] || 'Unknown',
  });
};

/** GET /timeline — paginated events (infinite scroll) */
exports.listEvents = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || PAGINATION.DEFAULT_PAGE, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 15, 50);
    const skip = (page - 1) * limit;

    const filter = buildListFilter(req.user._id, req.query);

    const [events, total] = await Promise.all([
      HealthTimelineEvent.find(filter)
        .sort({ eventDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      HealthTimelineEvent.countDocuments(filter),
    ]);

    new ApiResponse(200, 'Timeline events retrieved', events, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + events.length < total,
    }).send(res);
  } catch (error) {
    next(error);
  }
};

/** GET /timeline/years — distinct years for filter dropdown */
exports.getAvailableYears = async (req, res, next) => {
  try {
    const years = await HealthTimelineEvent.aggregate([
      { $match: { userId: req.user._id, isDeleted: false } },
      { $group: { _id: { $year: '$eventDate' } } },
      { $sort: { _id: -1 } },
    ]);

    const data = years.map((y) => y._id).filter(Boolean);
    new ApiResponse(200, 'Timeline years retrieved', data).send(res);
  } catch (error) {
    next(error);
  }
};

/** GET /timeline/:id */
exports.getEventById = async (req, res, next) => {
  try {
    const event = await HealthTimelineEvent.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isDeleted: false,
    });

    if (!event) {
      return next(ApiError.notFound('Timeline event not found.'));
    }

    new ApiResponse(200, 'Timeline event retrieved', event).send(res);
  } catch (error) {
    next(error);
  }
};

/** POST /timeline — create with optional attachments */
exports.createEvent = async (req, res, next) => {
  try {
    const { eventDate, category, eventType, doctor, hospital, description, notes } = req.body;

    const attachments = mapUploadedFiles(req.files);

    const event = await HealthTimelineEvent.create({
      userId: req.user._id,
      eventDate,
      category,
      eventType: eventType || category,
      doctor,
      hospital,
      description,
      notes,
      attachments,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    await logActivity(
      req,
      'Timeline Event Created',
      `Added timeline event: ${eventType || category} on ${new Date(eventDate).toDateString()}.`
    );

    new ApiResponse(201, 'Timeline event created', event).send(res);
  } catch (error) {
    if (req.files?.length) await cleanupUploadedFiles(req.files);
    next(error);
  }
};

/** PUT /timeline/:id */
exports.updateEvent = async (req, res, next) => {
  try {
    const event = await HealthTimelineEvent.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isDeleted: false,
    });

    if (!event) {
      return next(ApiError.notFound('Timeline event not found.'));
    }

    const fields = ['eventDate', 'category', 'eventType', 'doctor', 'hospital', 'description', 'notes'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) event[field] = req.body[field];
    });

    if (req.files?.length) {
      event.attachments.push(...mapUploadedFiles(req.files));
    }

    event.updatedBy = req.user._id;
    await event.save();

    await logActivity(req, 'Timeline Event Updated', `Updated timeline event: ${event.eventType || event.category}.`);

    new ApiResponse(200, 'Timeline event updated', event).send(res);
  } catch (error) {
    if (req.files?.length) await cleanupUploadedFiles(req.files);
    next(error);
  }
};

/** DELETE /timeline/:id — soft delete */
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await HealthTimelineEvent.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isDeleted: false,
    });

    if (!event) {
      return next(ApiError.notFound('Timeline event not found.'));
    }

    event.isDeleted = true;
    event.deletedAt = new Date();
    event.deletedBy = req.user._id;
    event.updatedBy = req.user._id;
    await event.save();

    await logActivity(req, 'Timeline Event Deleted', `Removed timeline event: ${event.eventType || event.category}.`);

    new ApiResponse(200, 'Timeline event deleted').send(res);
  } catch (error) {
    next(error);
  }
};

/** DELETE /timeline/:id/attachments/:attachmentId */
exports.deleteAttachment = async (req, res, next) => {
  try {
    const event = await HealthTimelineEvent.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isDeleted: false,
    });

    if (!event) {
      return next(ApiError.notFound('Timeline event not found.'));
    }

    const attachment = event.attachments.id(req.params.attachmentId);
    if (!attachment) {
      return next(ApiError.notFound('Attachment not found.'));
    }

    const isPDF = attachment.mimeType === 'application/pdf' || attachment.fileUrl.endsWith('.pdf');
    await deleteFromCloudinary(attachment.publicId, isPDF ? 'raw' : 'image');
    attachment.deleteOne();
    event.updatedBy = req.user._id;
    await event.save();

    new ApiResponse(200, 'Attachment removed', event).send(res);
  } catch (error) {
    next(error);
  }
};
