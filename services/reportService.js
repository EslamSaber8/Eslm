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
const topFiveModel = require("../models/topFiveModel")

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
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
    if (req.body.isPartAvailable === false || req.body.isPartAvailable === "false") {
        let vendor = await User.find({ role: "vendor", verified: true })
        if (vendor) {
            vendor.forEach(async (vendor) => {
                sendSms(vendor.phone, `You have a new report to post an offer on it.`, next)
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
            isPartAvailable: req.body.isPartAvailable,
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
    // const progress = req.query.progress || "workshopoffers"
    //limit 20 reports
    const reportCount = await Report.find()
        .where({
            $or: [{ selectWorkshop: true, allowedWorkshop: { $in: [user] } }, { selectWorkshop: false }],
            reportStatus: query,
        })
        .countDocuments()
    const reports = await Report.find()
        .where({
            $or: [{ selectWorkshop: true, allowedWorkshop: { $in: [user] } }, { selectWorkshop: false }],
            reportStatus: query,
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
        numberOfPages: Math.ceil(reportCount / limit),
        data: reports,
    })
})
exports.acceptVendorOffer = asyncHandler(async (req, res, next) => {
    const report = await Report.findById(req.params.id)
    if (!report) {
        return next(new ApiError(`No document for this id ${req.params.id}`, 404))
    }
    if (report.selectedVendor) {
        return next(new ApiError(`You already accepted an offer`, 400))
    }
    if (report.isWorkshopHaveParts) {
        return next(new ApiError(`You already accepted parts from workshops`, 400))
    }
    report.selectedVendor = req.body.vendorId
    await report.save()
    let vendor = await User.findById(req.body.vendorId)
    await sendSms(vendor.phone, `Your offer has been accepted.`, next)
    res.status(200).json({ data: report })
})

exports.acceptWorkshopOffer = asyncHandler(async (req, res, next) => {
    const report = await Report.findById(req.params.id)
    if (!report) {
        return next(new ApiError(`No document for this id ${req.params.id}`, 404))
    }
    if (report.selectedWorkshopOffer) {
        return next(new ApiError(`You already accepted an offer`, 400))
    }
    report.isWorkshopHaveParts = req.body.isWorkshopHaveParts

    if (report.selectedVendor) {
        report.isWorkshopHaveParts = false
    }

    if (report.progress === "workshopoffers") {
        report.progress = "driveroffers"
        report.selectedWorkshopOffer = req.body.workshopId
        report.reportStatus = "progress"
        await report.save()
        let workshop = await User.findById(req.body.workshopId)
        await sendSms(workshop.phone, `Your offer has been accepted.`, next)
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
        await sendSms(driver.phone, `Your offer has been accepted.`, next)

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
        report.progress = "workshopinprogress"
        await report.save()
        let workshop = await User.findById(report.selectedWorkshopOffer)
        await sendSms(workshop.phone, `The driver has finished the delivery.`, next)

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
        await sendSms(selectInsuranceCompany.phone, `The workshop has finished the fixing, check it out.`, next)

        res.status(200).json({ data: report })
    } else {
        return next(new ApiError(`You are not allowed to perform this action`, 403))
    }
})

exports.vendorFinishDelivery = asyncHandler(async (req, res, next) => {
    const report = await Report.findById(req.params.id)
    if (!report) {
        return next(new ApiError(`No document for this id ${req.params.id}`, 404))
    }
    if (report.selectedVendor) {
        report.vendorStatus = "delivered"
        await report.save()
        let selectInsuranceCompany = await User.findById(report.createdBy)
        await sendSms(selectInsuranceCompany.phone, `The vendor has finished the delivery, check it out.`, next)

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
        const workshop = report.selectedWorkshopOffer
        const date = new Date()
        const monthName = monthNames[date.getMonth()]
        const topFiveWorkshop = await topFiveModel.find({ type: "workshop", user: workshop, year: date.getFullYear() })
        if (!topFiveWorkshop) {
            await topFiveModel.create({
                type: "workshop",
                user: workshop,
                year: date.getFullYear(),
                months: { [monthName]: { weekNumber: Math.ceil(date.getDay() / 7), Completed: 1 } },
            })
        } else {
            let month = topFiveWorkshop.months[monthName]
            if (!month) {
                topFiveWorkshop.months[monthName] = { weekNumber: Math.ceil(date.getDay() / 7), Completed: 1 }
            } else {
                topFiveWorkshop.months[monthName] = {
                    weekNumber: Math.ceil(date.getDay() / 7),
                    Completed: month.Completed + 1,
                }
            }
            await topFiveWorkshop.save()
        }
        const driver = report.selectedDriverOffer
        const topFiveDriver = await topFiveModel.find({ type: "driver", user: driver, year: new Date().getFullYear() })
        if (!topFiveDriver) {
            await topFiveModel.create({
                type: "driver",
                user: driver,
                year: date.getFullYear(),
                months: { [monthName]: { weekNumber: Math.ceil(date.getDay() / 7), Completed: 1 } },
            })
        } else {
            let month = topFiveDriver.months[monthName]
            if (!month) {
                topFiveDriver.months[monthName] = { weekNumber: Math.ceil(date.getDay() / 7), Completed: 1 }
            } else {
                topFiveDriver.months[monthName] = {
                    weekNumber: Math.ceil(date.getDay() / 7),
                    Completed: month.Completed + 1,
                }
            }
            await topFiveDriver.save()
        }
        const insurance = report.createdBy
        const topFiveInsurance = await topFiveModel.find({ type: "insurance", user: insurance, year: new Date().getFullYear() })
        if (!topFiveInsurance) {
            await topFiveModel.create({
                type: "insurance",
                user: insurance,
                year: date.getFullYear(),
                months: { [monthName]: { weekNumber: Math.ceil(date.getDay() / 7), Completed: 1 } },
            })
        } else {
            let month = topFiveInsurance.months[monthName]
            if (!month) {
                topFiveInsurance.months[monthName] = { weekNumber: Math.ceil(date.getDay() / 7), Completed: 1 }
            } else {
                topFiveInsurance.months[monthName] = {
                    weekNumber: Math.ceil(date.getDay() / 7),
                    Completed: month.Completed + 1,
                }
            }
            await topFiveInsurance.save()
        }

        res.status(200).json({ data: report })
    } else {
        return next(new ApiError(`You are not allowed to perform this action`, 403))
    }
})
