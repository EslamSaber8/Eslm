const bannerModel = require("../models/bannerModel")
const factory = require("./handlersFactory")

// @desc    Get list of brands
// @route   GET /api/v1/brands
// @access  Public
exports.getBanners = factory.getAll(bannerModel)

// @desc    Get specific brand by id
// @route   GET /api/v1/brands/:id
// @access  Public
exports.getBanner = factory.getOne(bannerModel)

// @desc    Create brand
// @route   POST  /api/v1/brands
// @access  Private
exports.createBanner = factory.createOne(bannerModel)

// @desc    Update specific brand
// @route   PUT /api/v1/brands/:id
// @access  Private
exports.updateBanner = factory.updateOne(bannerModel)

// @desc    Delete specific brand
// @route   DELETE /api/v1/brands/:id
// @access  Private
exports.deleteBanner = factory.deleteOne(bannerModel)
