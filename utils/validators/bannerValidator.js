const slugify = require("slugify")
const { check, body } = require("express-validator")
const validatorMiddleware = require("../../middlewares/validatorMiddleware")

exports.getBannerValidator = [check("id").isMongoId().withMessage("Invalid Brand id format"), validatorMiddleware]

// exports.createBannerValidator = [
//     check("title").notEmpty().withMessage("Banner title is required"),
//     check("colorOne").notEmpty().withMessage("Banner first color is required"),
//     check("colorTwo").notEmpty().withMessage("Banner second color is required"),
//     validatorMiddleware,
// ]

exports.updateBannerValidator = [check("id").isMongoId().withMessage("Invalid Brand id format"), /*body("title").optional(),*/ validatorMiddleware]

exports.deleteBannerValidator = [check("id").isMongoId().withMessage("Invalid Brand id format"), validatorMiddleware]
