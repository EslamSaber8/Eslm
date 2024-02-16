const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const bcrypt = require('bcryptjs');

const factory = require('./handlersFactory');
const ApiError = require('../utils/apiError');
const { uploadMixOfImages } = require('../middlewares/uploadImageMiddleware');
const createToken = require('../utils/createToken');
const Report = require('../models/reportModel');

// Upload single image
exports.uploadUserImage = uploadMixOfImages('images');

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat('jpeg')
      .jpeg({ quality: 95 })
      .toFile(`uploads/users/${filename}`);

    // Save image into our db
    req.body.images = filename;
  }

  next();
});

// @desc    Get list of  reports
// @route   GET /api/v1/ reports
// @access  Private/Admin
exports.getReports = factory.getAll(Report);

// @desc    Get specific report by id
// @route   GET /api/v1/ reports/:id
// @access  Private/Admin
exports.getReport = factory.getOne(Report);

// @desc    Create report
// @route   POST  /api/v1/users
// @access  Private/Admin
exports.createReport = factory.createOne(Report);

// @desc    Update specific user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
exports.updateReport = asyncHandler(async (req, res, next) => {
  const document = await Report.findByIdAndUpdate(
    req.params.id,
    {
        images: req.body.images,
        carMake: req.body.carMake,
        carModel: req.body.carModel,
        carNumber: req.body.carNumber,
        reportDescription: req.body.reportDescription,
        partsList: req.body.partsList,
        locationOfVehicle: req.body.locationOfVehicle,
        selectWorkshop: req.body.selectWorkshop,
        selectInsuranceCompany: req.body.selectInsuranceCompany,
        uploadFiles: req.body.uploadFiles
      
    },
    {
      new: true,
    }
  );

  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});

// @desc    Delete specific user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteReport = factory.deleteOne(Report);