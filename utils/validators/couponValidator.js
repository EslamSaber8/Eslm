const slugify = require("slugify")
const { check, body } = require("express-validator")
const validatorMiddleware = require("../../middlewares/validatorMiddleware")
const Category = require("../../models/categoryModel")
const productModel = require("../../models/productModel")
couponModel=require("../../models/couponModel");

exports.createCouponValidator = [
    check("name")
        .isLength({ min: 3 })
        .withMessage("must be at least 3 chars")
        .notEmpty()
        .withMessage("Coupon name required")
        .custom((val, { req }) => {
            req.body.slug = slugify(val)
            return true
        }),
    check("discount")
        .optional()
        .isNumeric()
        .withMessage("coupon Discount must be a number")
        .custom((value, { req }) => {
            if (value > 100||value <0) {
                throw new Error("Discount  must be between 0 and 100")
            }
            return true
        }),

    check("expire").notEmpty().withMessage("Product Make is required"),
    validatorMiddleware,
]

exports.getCouponValidator = [check("id").isMongoId().withMessage("Invalid ID formate"), validatorMiddleware]

exports.updateCouponValidator = [
    check("id").isMongoId().withMessage("Invalid ID formate"),

    check("discount")
        .optional()
        .isNumeric()
        .withMessage("Product Discount must be a number")
        .custom(async (value, { req }) => {
            if (value > 100||value <0) {
                throw new Error("Discount  must be between 0 and 100")
            }
            return true
        }),
       
    validatorMiddleware,
]

exports.deleteProductValidator = [check("id").isMongoId().withMessage("Invalid ID formate"), validatorMiddleware]