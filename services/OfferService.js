const asyncHandler = require("express-async-handler")
const factory = require("./handlersFactory")
const ApiError = require("../utils/apiError")
const Offer = require("../models/OfferModel")
const Report = require("../models/reportModel")

// @desc    Get list of Offers
// @route   GET /api/v1/Offers
// @access  Private/Admin
exports.getOffers = factory.getAll(Offer)

// @desc    Get specific Offer by id
// @route   GET /api/v1/ Offers/:id
// @access  Private/Admin
exports.getOffer = factory.getOne(Offer)

// @desc    Create Offer
// @route   POST  /api/v1/Offers
// @access  Private/Admin
// exports.createOffer = factory.createOne(Offer)
exports.createOffer = asyncHandler(async (req, res, next) => {
    const user = req.user
    const id = req.body.report
    const report = await Report.findById(id).populate("offers")
    if ((user.role === "workshop" && report.progress != "workshopoffers") || (user.role === "driver" && report.progress != "driveroffers")) {
        return next(new ApiError("You are not allowed to create an offer for this report", 403))
    } else if (report.selectWorkshop && user.role === "workshop" && !report.allowedWorkshop.includes(user._id)) {
        return next(new ApiError("You are not allowed to create an offer for this report", 403))
    }
    req.body.createdBy = req.user._id
    const document = await Offer.create(req.body)

    res.status(201).json({ data: document })
})
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
    )

    if (!document) {
        return next(new ApiError(`No document for this id ${req.params.id}`, 404))
    }
    res.status(200).json({ data: document })
})

// @desc    Delete specific Offer
// @route   DELETE /api/v1/Offers/:id
// @access  Private/Admin
exports.deleteOffer = factory.deleteOne(Offer)
