const asyncHandler = require('express-async-handler');
const factory = require('./handlersFactory');
const ApiError = require('../utils/apiError');
const Offer = require('../models/OfferModel');


// @desc    Get list of Offers
// @route   GET /api/v1/Offers
// @access  Private/Admin
exports.getOffers = factory.getAll(Offer);

// @desc    Get specific Offer by id
// @route   GET /api/v1/ Offers/:id
// @access  Private/Admin
exports.getOffer = factory.getOne(Offer);

// @desc    Create Offer
// @route   POST  /api/v1/Offers
// @access  Private/Admin
exports.createOffer = factory.createOne(Offer);

// @desc    Update specific Offer
// @route   PUT /api/v1/Offers/:id
// @access  Private/Admin
exports.updateOffer = asyncHandler(async (req, res, next) => {
  const document = await Offer.findByIdAndUpdate(
    req.params.id,
    {
        price: req.body.price,
        deadline: req.body.deadline,
        partPrice: req.body.partPrice,
      
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

// @desc    Delete specific Offer
// @route   DELETE /api/v1/Offers/:id
// @access  Private/Admin
exports.deleteOffer = factory.deleteOne(Offer);