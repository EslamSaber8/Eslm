const express = require("express")
const { signupValidator, loginValidator } = require("../utils/validators/authValidator")

const { signup, login, forgotPassword, verifyPassResetCode, resetPassword, allowedTo, signupAs, protect } = require("../services/authService")

const router = express.Router()
//  /workshop
router.post("/signup/:role", signupValidator, signupAs)
router.post("/login", loginValidator, login)
router.post("/forgotPassword", forgotPassword)
router.post("/verifyResetCode", verifyPassResetCode)
router.put("/resetPassword", resetPassword)

router.use(protect)

router.post("/signup", allowedTo("superAdmin"), signupValidator, signup)

module.exports = router
