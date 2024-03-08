const express = require("express")
const { signupValidator, loginValidator } = require("../utils/validators/authValidator")

const {
    signup,
    login,
    forgotPassword,
    verifyPassResetCode,
    resetPassword,
    allowedTo,
    signupAs,
    protect,
    verifyEmail,
    resendVerifyCode,
} = require("../services/authService")
const { uploadMultipleImages } = require("../utils/uploadImages")
const router = express.Router()
//  /workshop

router.post("/signup/:role", uploadMultipleImages,signupValidator, signupAs)
router.post("/login", loginValidator, login)
router.post("/forgotPassword", forgotPassword)
router.post("/verifyResetCode", verifyPassResetCode)
router.put("/resetPassword", resetPassword)

router.use(protect)

router.post("/verify", verifyEmail)
router.post("/newVerification", resendVerifyCode)

router.post("/signup", allowedTo("superAdmin"), signupValidator, signup)

module.exports = router
