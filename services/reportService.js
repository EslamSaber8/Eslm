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
const mongoose = require("mongoose")

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
// @desc    Get list of  reports
// @route   GET /api/v1/ reports
// @access  Private/Admin
exports.getReports = factory.getAll(Report)

// @desc    Get specific report by id
// @route   GET /api/v1/ reports/:id
// @access  Private/Admin
// exports.getReport = factory.getOne(Report, "offers selectedWorkshopOffer")
exports.getReport = asyncHandler(async (req, res, next) => {
    const search =
        req.query != null && Object.keys(req.query).length > 0
            ? {
                  $and: Object.keys(req.query).map((key) => {
                      if (req.query[key] != null && req.query[key] != "null" && req.query[key] != "") {
                          if (
                              key != "search" &&
                              !mongoose.Types.ObjectId.isValid(req.query[key]) &&
                              typeof req.query[key] != "boolean" &&
                              req.query[key] === "true" &&
                              req.query[key] === "false" &&
                              key != "year"
                          ) {
                              {
                                  if (req.query[key] != null) return { [key]: { $regex: req.query[key], $options: "i" } }
                              }
                          } else {
                              if (req.query[key] != null) return { [key]: req.query[key] }
                          }
                      } else {
                          return {}
                      }
                  }),
              }
            : {}
    const report = await Report.findById(req.params.id).populate("offers selectedWorkshopOffer").where(search)
    let vendorOffers = []
    let driverOffers = []
    let workshopOffers = []
    //sort offers by Type
    if (report && report.offers.length > 0) {
        report.offers.forEach((offer) => {
            if (offer.type === "vendor") {
                vendorOffers.push(offer)
            } else if (offer.type === "driver") {
                driverOffers.push(offer)
            } else if (offer.type === "workshop") {
                workshopOffers.push(offer)
            }
        })
    }
    if (!report) {
        return next(new ApiError(`No document for this id ${req.params.id}`, 404))
    }
    res.status(200).json({ data: report, vendorOffers, driverOffers, workshopOffers })
})

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
                user.notifications.push({ type: "report", moveID: document._id, message: "You have a new report to post an offer on it." })
                await user.save()
                sendSms(user.phone, `You have a new report to post an offer on it.`, next)
                sentWorkshop++
            }
        })
    } else {
        let workshop = await User.find({ role: "workshop", verified: true })
        // console.log(workshop);
        if (workshop) {
            workshop.forEach(async (workshop) => {
                workshop.notifications.push({ type: "report", moveID: document._id, message: "You have a new report to post an offer on it." })
                await workshop.save()
                sendSms(workshop.phone, `You have a new report to post an offer on it.`, next)
                sentWorkshop++
            })
        }
    }
    if (
        (req.body.selectVendor === true || req.body.selectVendor === "true") &&
        (req.body.isPartAvailable === false || req.body.isPartAvailable === "false")
    ) {
        req.body.allowedVendor.forEach(async (vendor) => {
            const vendors = await User.findById(vendor)
            vendors.notifications.push({ type: "report", moveID: document._id, message: "You have a new report to post an offer on it." })
            await vendors.save()
            sendSms(vendors.phone, `You have a new report to post an offer on it.`, next)
        })
    } else if (
        (req.body.selectVendor === false || req.body.selectVendor === "false") &&
        (req.body.isPartAvailable === false || req.body.isPartAvailable === "false")
    ) {
        let vendor = await User.find({ role: "vendor", verified: true })
        if (vendor) {
            vendor.forEach(async (vendor) => {
                vendor.notifications.push({ type: "report", moveID: document._id, message: "You have a new report to post an offer on it." })
                await vendor.save()
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
    if (report.selectedWorkshopOffer && !report.isWorkshopHaveParts) {
        report.reportStatus = "progress"
        report.progress = "driveroffers"
    }
    await report.save()
    let vendor = await User.findById(req.body.vendorId)
    vendor.notifications.push({ type: "report", moveID: report._id, message: "Your offer has been accepted." })
    await vendor.save()
    await sendSms(vendor.phone, `Your offer has been accepted.`, next)
    if (report.selectedWorkshopOffer && !report.isWorkshopHaveParts) {
        let user = await User.find({ role: "driver", verified: true })
        user.forEach(async (user) => {
            user.notifications.push({ type: "report", moveID: report._id, message: "You have a new report to post an offer on it." })
            await user.save()
            sendSms(user.phone, `You have a new report to post an offer on it.`, next)
        })
    }
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
        report.selectedWorkshopOffer = req.body.workshopId
        if (report.isWorkshopHaveParts || report.selectedVendor) {
            report.reportStatus = "progress"
            report.progress = "driveroffers"
        }
        await report.save()
        let workshop = await User.findById(req.body.workshopId)
        workshop.notifications.push({ type: "report", moveID: report._id, message: "Your offer has been accepted." })
        await workshop.save()
        await sendSms(workshop.phone, `Your offer has been accepted.`, next)
        if (report.isWorkshopHaveParts || report.selectedVendor) {
            let user = await User.find({ role: "driver", verified: true })
            user.forEach(async (user) => {
                user.notifications.push({ type: "report", moveID: report._id, message: "You have a new report to post an offer on it." })
                await user.save()
                sendSms(user.phone, `You have a new report to post an offer on it.`, next)
            })
        }

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
        driver.notifications.push({ type: "report", moveID: report._id, message: "Your offer has been accepted." })
        await driver.save()
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
        workshop.notifications.push({ type: "report", moveID: report._id, message: "The driver has finished the delivery." })
        await workshop.save()
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
        selectInsuranceCompany.notifications.push({
            type: "report",
            moveID: report._id,
            message: "The workshop has finished the fixing, check it out.",
        })
        await selectInsuranceCompany.save()
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
        selectInsuranceCompany.notifications.push({
            type: "report",
            moveID: report._id,
            message: "The vendor has finished the delivery, check it out.",
        })
        await selectInsuranceCompany.save()
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
        const topFiveWorkshop = await topFiveModel.findOne({ type: "workshop", user: workshop, year: date.getFullYear() })
        if (!topFiveWorkshop) {
            await topFiveModel.create({
                type: "workshop",
                user: workshop,
                year: date.getFullYear(),
                months: { [monthName]: { weekNumber: Math.ceil(date.getDate() / 7), Completed: 1 } },
            })
        } else {
            let monthArray = topFiveWorkshop.months[monthName]
            const weekArray = monthArray.find((week) => week.weekNumber === Math.ceil(date.getDate() / 7))
            if (weekArray) {
                weekArray.Completed = weekArray.Completed + 1
            } else {
                monthArray.push({
                    weekNumber: Math.ceil(date.getDate() / 7),
                    Completed: 1,
                })
            }

            topFiveWorkshop.months[monthName] = monthArray
            await topFiveWorkshop.save()
        }
        const driver = report.selectedDriverOffer
        const topFiveDriver = await topFiveModel.findOne({ type: "driver", user: driver, year: new Date().getFullYear() })
        if (!topFiveDriver) {
            await topFiveModel.create({
                type: "driver",
                user: driver,
                year: date.getFullYear(),
                months: { [monthName]: { weekNumber: Math.ceil(date.getDate() / 7), Completed: 1 } },
            })
        } else {
            let monthArray = topFiveDriver.months[monthName]
            const weekArray = monthArray.find((week) => week.weekNumber === Math.ceil(date.getDate() / 7))
            if (weekArray) {
                weekArray.Completed = weekArray.Completed + 1
            } else {
                monthArray.push({
                    weekNumber: Math.ceil(date.getDate() / 7),
                    Completed: 1,
                })
            }
            topFiveDriver.months[monthName] = monthArray
            await topFiveDriver.save()
        }
        const insurance = report.createdBy
        const topFiveInsurance = await topFiveModel.findOne({ type: "insurance", user: insurance, year: new Date().getFullYear() })
        if (!topFiveInsurance) {
            await topFiveModel.create({
                type: "insurance",
                user: insurance,
                year: date.getFullYear(),
                months: { [monthName]: { weekNumber: Math.ceil(date.getDate() / 7), Completed: 1 } },
            })
        } else {
            let monthArray = topFiveInsurance.months[monthName]
            const weekArray = monthArray.find((week) => week.weekNumber === Math.ceil(date.getDate() / 7))
            if (weekArray) {
                weekArray.Completed = weekArray.Completed + 1
            } else {
                monthArray.push({
                    weekNumber: Math.ceil(date.getDate() / 7),
                    Completed: 1,
                })
            }
            topFiveInsurance.months[monthName] = monthArray
            await topFiveInsurance.save()
        }

        res.status(200).json({ data: report })
    } else {
        return next(new ApiError(`You are not allowed to perform this action`, 403))
    }
})
