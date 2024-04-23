const crypto = require("crypto")

const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

const asyncHandler = require("express-async-handler")
const ApiError = require("../utils/apiError")
const sendEmail = require("../utils/sendEmail")
const createToken = require("../utils/createToken")

const User = require("../models/userModel")
const { sendSms } = require("../utils/sendSms")

// @desc    Signup
// @route   GET /api/v1/auth/signup
// @access  Public
exports.signupAs = asyncHandler(async (req, res, next) => {
    // 1- Create user
    const allowedRoles = ["workshop", "driver", "vendor"]
    if (!allowedRoles.includes(req.params.role)) {
        return next(new ApiError(`${req.__("signupAs")} ${req.params.role}`, 400))
    }
    const verifyCode = Math.floor(1000 + Math.random() * 9000).toString()
    const verifyCodeExpires = Date.now() + 10 * 60 * 1000

    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        role: req.params.role,
        license: req.body.license,
        idImg: req.body.idImg,
        workshopLocationLat: req.body.workshopLocationLat,
        workshopLocationLong: req.body.workshopLocationLong,
        verifyCode,
        verifyCodeExpires,
        password: req.body.password,
        phone: req.body.phone,
        license: req.body.license,
        idImg: req.body.idImg,
    })

    // 2- Generate token
    const token = createToken(user._id)

    // 3- Send verify code via sms
    await sendSms(user.phone, `${req.__("smsFirst")} ${user.verifyCode} ${req.__("smsLast")}`, next)

    return res.status(201).json({ data: user, token })
})

exports.signup = asyncHandler(async (req, res, next) => {
    // 1- Create user
    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        accountState: "approved",
        password: req.body.password,
        phone: req.body.phone,
        idImg: req.body.idImg,
    })

    // 2- Generate token
    const token = createToken(user._id)

    res.status(201).json({ data: user, token })
})

// @desc    Login
// @route   GET /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
    // 1) check if password and email in the body (validation)
    // 2) check if user exist & check if password is correct
    const user = await User.findOne({ email: req.body.email })

    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
        return next(new ApiError(req.__("incorrectEmailOrPass"), 401))
    }

    // 3) generate token
    const token = createToken(user._id)

    // Delete password from response
    delete user._doc.password
    // 4) send response to client side
    res.status(200).json({ data: user, token })
})

// @desc   make sure the user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
    // 1) Check if token exist, if exist get
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1]
    }
    if (!token) {
        return next(new ApiError(req.__("youAreNotLoggedToAccess"), 401))
    }

    // 2) Verify token (no change happens, expired token)
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)

    // 3) Check if user exists
    const currentUser = await User.findById(decoded.userId)
    if (!currentUser) {
        return next(new ApiError(req.__("noUserWithToken"), 401))
    }

    // 4) Check if user change his password after token created
    if (currentUser.passwordChangedAt) {
        const passChangedTimestamp = parseInt(currentUser.passwordChangedAt.getTime() / 1000, 10)
        // Password changed after token created (Error)
        if (passChangedTimestamp > decoded.iat) {
            return next(new ApiError(req.__("userChangedPasswordRecently"), 401))
        }
    }

    req.user = currentUser
    next()
})

// @desc    Authorization (User Permissions)
// ["admin", "superAdmin"]
exports.allowedTo = (...roles) =>
    asyncHandler(async (req, res, next) => {
        // 1) access roles
        // 2) access registered user (req.user.role)
        if (!roles.includes(req.user.role)) {
            return next(new ApiError(req.__("notAlowedRoute"), 403))
        }
        next()
    })

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotPassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    // 1) Get user by email
    const user = await User.findOne({ phone: req.body.phone })
    if (!user) {
        return next(new ApiError(`${req.__("noUserwithEmail")} ${req.body.phone}`, 404))
    }
    // 2) If user exist, Generate hash reset random 6 digits and save it in db
    const resetCode = Math.floor(1000 + Math.random() * 9000).toString()
    const hashedResetCode = crypto.createHash("sha256").update(resetCode).digest("hex")

    // Save hashed password reset code into db
    user.passwordResetCode = hashedResetCode
    // Add expiration time for password reset code (10 min)
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000
    user.passwordResetVerified = false

    await user.save()

    // 3) Send the reset code via email

    const message = `${req.__("hi")} ${user.name},\n ${req.__("forgotSms")} \n ${resetCode} \n ${req.__("forgotSms2")}`
    try {
        await sendSms(user.phone, message, next)
    } catch (err) {
        user.passwordResetCode = undefined
        user.passwordResetExpires = undefined
        user.passwordResetVerified = undefined

        await user.save()
        return next(new ApiError(req.__("errorSendingSms"), 500))
    }

    res.status(200).json({ status: "Success", message: req.__("resetDone") })
})

// @desc    Verify password reset code
// @route   POST /api/v1/auth/verifyResetCode
// @access  Public
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
    // 1) Get user based on reset code
    const hashedResetCode = crypto.createHash("sha256").update(req.body.resetCode).digest("hex")

    const user = await User.findOne({
        passwordResetCode: hashedResetCode,
        passwordResetExpires: { $gt: Date.now() },
    })
    if (!user) {
        return next(new ApiError(req.__("expiredCode"), 400))
    }

    // 2) Reset code valid
    user.passwordResetVerified = true
    await user.save()

    res.status(200).json({
        status: "Success",
    })
})

// @desc    Reset password
// @route   POST /api/v1/auth/resetPassword
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    // 1) Get user based on email
    const user = await User.findOne({ phone: req.body.phone })
    if (!user) {
        return next(new ApiError(`${req.__("noUserwithEmail")} ${req.body.phone}`, 404))
    }

    // 2) Check if reset code verified
    if (!user.passwordResetVerified) {
        return next(new ApiError(req.__("resetCodeInvalid"), 400))
    }

    user.password = req.body.newPassword
    user.passwordResetCode = undefined
    user.passwordResetExpires = undefined
    user.passwordResetVerified = undefined

    await user.save()

    // 3) if everything is ok, generate token
    const token = createToken(user._id)
    res.status(200).json({ status: "Success", token })
})

exports.verifyEmail = asyncHandler(async (req, res, next) => {
    // 1) Get user based on verify code
    const userId = req.user

    const user = await User.findById(userId._id)

    if (user.verified) {
        return next(new ApiError(req.__("emailAlreadyVerified"), 400))
    }
    if (user.verifyCode !== req.body.verifyCode) {
        return next(new ApiError(req.__("expiredCodeOrExpired"), 400))
    }

    if (user.verifyCodeExpires < Date.now()) {
        return next(new ApiError(req.__("expiredCodeOrExpired"), 400))
    }

    // const userVerified = User.findByIdAndUpdate(user._id.toString(), { verified: true, verifyCode: undefined, verifyCodeExpires: undefined }, { new: true })

    // 2) Verify code valid
    user.verified = true
    user.verifyCode = undefined
    user.verifyCodeExpires = undefined

    await user.save()

    // console.log(userVerified);

    res.status(200).json({
        status: "Success",
        message: req.__("emailVerified"),
        user,
    })
})

exports.resendVerifyCode = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id)
    if (!user) {
        return next(new ApiError(`${req.__("noUserwithEmail")}`, 404))
    }
    if (user.verified) {
        return next(new ApiError(req.__("emailAlreadyVerified"), 400))
    }
    const verifyCode = Math.floor(1000 + Math.random() * 9000).toString()
    const verifyCodeExpires = Date.now() + 10 * 60 * 1000

    user.verifyCode = verifyCode
    user.verifyCodeExpires = verifyCodeExpires

    await user.save()
    const message = `${req.__("smsFirst")} ${user.verifyCode} ${req.__("smsLast")}`
    const smsResponse = await sendSms(user.phone, message, next)

    res.status(200).json({
        status: "Success",
        message: req.__("verifySend"),
        user,
    })
})

exports.GoogleAuth = asyncHandler(async (req, res, next) => {
    const { email } = req.params
    const user = await User.findOne({ email })
    if (!user) {
        // const newUser = await User.create({
        //     name: payload.name,
        //     email: payload.email,
        //     password: payload.sub,
        //     role: "user",
        // })
        // createSendToken(newUser, 200, res)
        return next(new ApiError(`${req.__("noUserwithEmail")} ${req.body.email}`, 404))
    } else {
        const token = createToken(user._id)
        res.status(200).json({ data: user, token })
    }
})

exports.remoteLogin = asyncHandler(async (req, res, next) => {
    console.log(req.body)
    // const user = await User.findOne({ email }).select("+password")
    // if (!user || !(await bcrypt.compare(password, user.password))) {
    //     return next(new ApiError(req.__("incorrectEmailOrPass"), 401))
    // }
    // const token = createToken(user._id)
    res.status(200).json({ data: req.body, token: "token" })
    // res.status(200).json({ data: user, token })
})
