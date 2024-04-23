const { check, body } = require("express-validator")
const validatorMiddleware = require("../../middlewares/validatorMiddleware")
const Offer = require("../../models/OfferModel")
const { use } = require("../../routes/reportRoute")

exports.getOfferValidator = [check("id").isMongoId().withMessage("Invalid Offer id format"), validatorMiddleware]

exports.createOfferValidator = [
    body("price").isNumeric().notEmpty().withMessage("price is required"),
    body("deadline")
        .toDate()

        .notEmpty()
        .withMessage("Date is required"),
    check('description')
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ max: 2000 })
    .withMessage('Too long description'),
    body("partPrice").isNumeric().optional(),

    check("report")
        .isMongoId()
        .withMessage("Invalid report id format")
        .custom((val, { req }) =>
            // Check if logged user create offer before
            Offer.findOne({ createdBy: req.user._id, report: req.body.report }).then((offer) => {
                if (offer) {
                    return Promise.reject(new Error("You already created a offer before"))
                }
            })
        ),
    
    validatorMiddleware,
]

exports.createDriverOfferValidator = [
    body("price").isNumeric().notEmpty().withMessage("price is required"),
    body("deadline")
        .toDate()
        .notEmpty()
        .withMessage("Date is required"),
    check("report")
        .isMongoId()
        .withMessage("Invalid report id format")
        .custom((val, { req }) =>
            // Check if logged user create offer before
            Offer.findOne({ createdBy: req.user._id, report: req.body.report }).then((offer) => {
                if (offer) {
                    return Promise.reject(new Error("You already created a offer before"))
                }
            })
        ),
    
    validatorMiddleware,
]












exports.updateOfferValidator = [
    body("price").optional().isNumeric().withMessage("Price must be a number"),
    body("deadline").optional().isISO8601().toDate().withMessage("Deadline must be a valid date"),
    body("partPrice").optional().isNumeric().withMessage("Part price must be a number"),

    check("id")
        .isMongoId()
        .withMessage("Invalid offer id format")
        .custom((val, { req }) =>
            // Check offer ownership before update
            Offer.findById(val).then((offer) => {
                if (!offer) {
                    return Promise.reject(new Error(`There is no offer with id ${val}`))
                }

                if (offer.user._id.toString() !== req.user._id.toString()) {
                    return Promise.reject(new Error(`Your are not allowed to perform this action`))
                }
            })
        ),

    validatorMiddleware,
]

exports.deleteOfferValidator = [
    check("id")
        .isMongoId()
        .withMessage("Invalid Offer id format")

        .custom((val, { req }) =>
            // Check offer ownership before update
            Offer.findById(val).then((offer) => {
                if (!offer) {
                    return Promise.reject(new Error(`There is no offer with id ${val}`))
                }

                if (offer.user._id.toString() !== req.user._id.toString()) {
                    return Promise.reject(new Error(`Your are not allowed to perform this action`))
                }
            })
        ),

    validatorMiddleware,
]
