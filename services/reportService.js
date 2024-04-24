const asyncHandler = require("express-async-handler")
// const sharp = require('sharp');
const bcrypt = require("bcryptjs")

const factory = require("./handlersFactory")
const ApiError = require("../utils/apiError")
// const { uploadMixOfImages } = require("../middlewares/uploadImageMiddleware")
const createToken = require("../utils/createToken")
const Report = require("../models/reportModel")
const offer = require("../models/OfferModel")
const { sendSms } = require("../utils/sendSms")
const User = require("../models/userModel")
const Offer = require("../models/OfferModel")

// @desc    Get list of  reports
// @route   GET /api/v1/ reports
// @access  Private/Admin
exports.getReports = factory.getAll(Report)

// @desc    Get specific report by id
// @route   GET /api/v1/ reports/:id
// @access  Private/Admin
exports.getReport = factory.getOne(Report, "offers selectedWorkshopOffer")

// @desc    Create report
// @route   POST  /api/v1/users
// @access  Private/Admin
exports.createReport = asyncHandler(async (req, res, next) => {
    req.body.createdBy = req.user._id
    if (
        req.body.selectWorkshop === "false" ||
        req.body.selectWorkshop === false ||
        ((req.body.selectWorkshop === "true" || req.body.selectWorkshop === true) && req.body.allowedWorkshop.length === 0)
    ) {
        req.body.allowedWorkshop = []
        req.body.selectWorkshop = false
    }
    const document = await Report.create(req.body)
    let sentWorkshop = 0
    if ((req.body.selectWorkshop === true || req.body.selectWorkshop === "true") && req.body.allowedWorkshop.length > 0) {
        let allowedWorkshop = req.body.allowedWorkshop
        allowedWorkshop.forEach(async (workshop) => {
            let user = await User.findById(workshop)
            if (user.role === "workshop") {
                sendSms(user.phone, `You have a new report to post an offer on it.`, next)
                sentWorkshop++
            }
        })
    } else {
        let workshop = await User.find({ role: "workshop", verified: true })
        // console.log(workshop);
        if (workshop) {
            workshop.forEach(async (workshop) => {
                sendSms(workshop.phone, `You have a new report to post an offer on it.`, next)
                sentWorkshop++
            })
        }
    }
    return res.status(201).json({ data: document, sentWorkshopNumber: sentWorkshop })
})

// @desc    Update specific user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
exports.updateReport = asyncHandler(async (req, res, next) => {
    const document = await Report.findByIdAndUpdate(
        req.params.id,
        {
            images: req.body.images,
            carMake: req.body.carMake,
            carModel: req.body.carModel,
            carNumber: req.body.carNumber,
            reportDescription: req.body.reportDescription,
            partsList: req.body.partsList,
            locationOfVehicle: req.body.locationOfVehicle,
            selectWorkshop: req.body.selectWorkshop,
            selectInsuranceCompany: req.body.selectInsuranceCompany,
            uploadFiles: req.body.uploadFiles,
        },
        {
            new: true,
        }
    )

    if (!document) {
        return next(new ApiError(`No document for this id ${req.params.id}`, 404))
    }
    res.status(200).json({ data: document })
})

// @desc    Delete specific user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteReport = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const document = await Report.findByIdAndDelete(id)

    if (!document) {
        return next(new ApiError(`No document for this id ${id}`, 404))
    }
    await Offer.deleteMany({ report: id })

    // Trigger "remove" event when update document
    document.remove()
    res.status(204).send()
})

exports.getReportsForWorkshops = asyncHandler(async (req, res, next) => {
    const user = req.user.id
    const page = req.query.page * 1 || 1
    const limit = req.query.limit * 1 || 20
    const skip = (page - 1) * limit
    const query = req.query.reportStatus || "pending"
    const progress = req.query.progress || "workshopoffers"
    //limit 20 reports
    const reports = await Report.find()
        .where({
            $or: [{ selectWorkshop: true, allowedWorkshop: { $in: [user] } }, { selectWorkshop: false }],
            reportStatus: query,
            progress,
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })

    // console.log(reports);

    res.status(200).json({
        status: "success",
        results: reports.length,
        currentPage: page,
        limit,
        // numberOfPages: Math.ceil(reports.length / limit),
        data: reports,
    })
})

exports.acceptWorkshopOffer = asyncHandler(async (req, res, next) => {
    const report = await Report.findById(req.params.id)
    if (!report) {
        return next(new ApiError(`No document for this id ${req.params.id}`, 404))
    }
    if (report.selectedWorkshopOffer) {
        return next(new ApiError(`You already accepted an offer`, 400))
    }
    if (report.progress === "workshopoffers") {
        report.progress = "driveroffers"
        report.selectedWorkshopOffer = req.body.workshopId
        report.reportStatus = "progress"
        await report.save()
        let workshop = await User.findById(req.body.workshopId)
        sendSms(workshop.phone, `Your offer has been accepted.`, next)
        let user = await User.find({ role: "driver", verified: true })
        user.forEach(async (user) => {
            sendSms(user.phone, `You have a new report to post an offer on it.`, next)
        })
        res.status(200).json({ data: report })
    } else {
        return next(new ApiError(`You are not allowed to perform this action`, 403))
    }
})

exports.acceptDriverOffer = asyncHandler(async (req, res, next) => {
    const report = await Report.findById(req.params.id)
    if (!report) {
        return next(new ApiError(`No document for this id ${req.params.id}`, 404))
    }
    if (report.selectedDriverOffer) {
        return next(new ApiError(`You already accepted an offer`, 400))
    }
    if (report.progress === "driveroffers") {
        report.progress = "driverinprogress"
        report.selectedDriverOffer = req.body.driverId
        await report.save()
        let driver = await User.findById(req.body.driverId)
        sendSms(driver.phone, `Your offer has been accepted.`, next)

        res.status(200).json({ data: report })
    } else {
        return next(new ApiError(`You are not allowed to perform this action`, 403))
    }
})

exports.driverFinishDelivery = asyncHandler(async (req, res, next) => {
    const report = await Report.findById(req.params.id)
    if (!report) {
        return next(new ApiError(`No document for this id ${req.params.id}`, 404))
    }
    if (report.progress === "driverinprogress") {
        report.progress = "drivercompleted"
        await report.save()
        let workshop = await User.findById(report.selectedWorkshopOffer)
        sendSms(workshop.phone, `The driver has finished the delivery.`, next)

        res.status(200).json({ data: report })
    } else {
        return next(new ApiError(`You are not allowed to perform this action`, 403))
    }
})

exports.workshopFinishFixing = asyncHandler(async (req, res, next) => {
    const report = await Report.findById(req.params.id)
    if (!report) {
        return next(new ApiError(`No document for this id ${req.params.id}`, 404))
    }
    if (report.progress === "workshopinprogress") {
        report.progress = "workshopcompleted"
        // report.reportStatus = "completed"
        await report.save()
        let selectInsuranceCompany = await User.findById(report.createdBy)
        sendSms(selectInsuranceCompany.phone, `The workshop has finished the fixing, check it out.`, next)

        res.status(200).json({ data: report })
    } else {
        return next(new ApiError(`You are not allowed to perform this action`, 403))
    }
})


exports.completeReport = asyncHandler(async (req, res, next) => {
    const report = await Report.findById(req.params.id)
    if (!report) {
        return next(new ApiError(`No document for this id ${req.params.id}`, 404))
    }
    if (report.progress === "workshopcompleted") {
        report.reportStatus = "completed"
        await report.save()
        let user = await User.findById(report.createdBy)
        sendSms(user.phone, `The workshop has finished the fixing, check it out.`, next)

        res.status(200).json({ data: report })
    } else {
        return next(new ApiError(`You are not allowed to perform this action`, 403))
    }
})