const { check, body } = require("express-validator")
const validatorMiddleware = require("../../middlewares/validatorMiddleware")

exports.getReportValidator = [check("id").isMongoId().withMessage("Invalid Report id format"), validatorMiddleware]

exports.createReportValidator = [
    // Validate images field
    body("images").notEmpty().withMessage("Images must be an array "),
    // Validate carMake field
    body("carMake").isString().notEmpty().withMessage("Car make is required"),
    // Validate carModel field`
    body("carModel").isString().notEmpty().withMessage("Car model is required"),
    // Validate carNumber field
    body("carNumber").isString().notEmpty().withMessage("Car number is required"),
    // Validate reportDescription field
    body("reportDescription").isString().notEmpty().withMessage("Report description is required"),
    // Validate locationOfVehicle field
    body("locationOfVehicle").isString().notEmpty().withMessage("Location of vehicle is required"),
    // Validate selectInsuranceCompany field
    validatorMiddleware,
]
exports.updateReportValidator = [
    // Validate images field if present
    body("images").optional(),
    // Validate carMake field if present
    body("carMake").optional().isString().withMessage("Car make must be a string"),
    // Validate carModel field if present
    body("carModel").optional().isString().withMessage("Car model must be a string"),
    // Validate carNumber field if present
    body("carNumber").optional().isString().withMessage("Car number must be a string"),
    // Validate reportDescription field if present
    body("reportDescription").optional().isString().withMessage("Report description must be a string"),
    // Validate locationOfVehicle field if present
    body("locationOfVehicle").optional().isString().withMessage("Location of vehicle must be a string"),
    // Validate selectInsuranceCompany field if present
    validatorMiddleware,
]
exports.deleteReportValidator = [check("id").isMongoId().withMessage("Invalid Report id format"), validatorMiddleware]
