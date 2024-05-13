const slugify = require("slugify")
const { check } = require("express-validator")
const validatorMiddleware = require("../../middlewares/validatorMiddleware")
const User = require("../../models/userModel")

exports.signupValidator = [
    check("name")
        .notEmpty()
        .withMessage("userReq")
        .isLength({ min: 3 })
        .withMessage("userlength")
        .custom((val, { req }) => {
            req.body.slug = slugify(val)
            return true
        }),

    check("email")
        .notEmpty()
        .withMessage("emailReq")
        .isEmail()
        .withMessage("emailInvalid")
        .custom((val) =>
            User.findOne({ email: val }).then((user) => {
                if (user) {
                    return Promise.reject(new Error("emailExists"))
                }
            })
        ),

    check("password")
        .notEmpty()
        .withMessage("passReq")
        .isLength({ min: 6 })
        .withMessage("passlength")
        .custom((password, { req }) => {
            if (password !== req.body.passwordConfirm) {
                throw new Error("passMatch")
            }
            return true
        }),

    check("passwordConfirm").notEmpty().withMessage("passReqConf"),

    check("license").notEmpty().withMessage("licenseReq"),
    check("government").notEmpty().withMessage("governmentReq"),

    check("idImg").notEmpty().withMessage("ID image required"),

    validatorMiddleware,
]

exports.loginValidator = [
    check("email").notEmpty().withMessage("emailReq").isEmail().withMessage("emailInvalid"),

    check("password").notEmpty().withMessage("passReq").isLength({ min: 6 }).withMessage("passlength"),

    validatorMiddleware,
]
