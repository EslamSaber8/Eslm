const { validationResult } = require("express-validator")
const ApiError = require("../utils/apiError")

// @desc  Finds the validation errors in this request and wraps them in an object with handy functions
const validatorMiddleware = (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        if(!req){
            return next(new ApiError(errors.array()[0].msg, 400))
        }
        return next(new ApiError(req.__(errors.array()[0].msg), 400))
        // return res.status(400).json({ errors: errors.array() });
    }
    next()
}

module.exports = validatorMiddleware
