const { check } = require("express-validator")
const validatorMiddleware = require("../../middlewares/validatorMiddleware")

exports.createCarTypeValidator = [
    check("make").notEmpty().withMessage("Make required"),

    check("model").notEmpty().withMessage("Model required"),

    check("year").notEmpty().withMessage("Year required"),

    validatorMiddleware,
]

exports.updateCarTypeValidator = [
    check("make").notEmpty().withMessage("Make required"),

    check("model").notEmpty().withMessage("Model required"),

    check("year").notEmpty().withMessage("Year required"),

    validatorMiddleware,
]

exports.getCarTypeValidator = [
    check("id").notEmpty().withMessage("ID required"),

    validatorMiddleware,
]

exports.deleteCarTypeValidator = [
    check("id").notEmpty().withMessage("ID required"),

    validatorMiddleware,
]


