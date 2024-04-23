const asyncHandler = require("express-async-handler")
// const sharp = require('sharp');
const bcrypt = require("bcryptjs")

const factory = require("./handlersFactory")
const ApiError = require("../utils/apiError")
// const { uploadMixOfImages } = require("../middlewares/uploadImageMiddleware")
const createToken = require("../utils/createToken")
const Report = require("../models/reportModel")
const offer=require("../models/OfferModel")
const { sendSms } = require("../utils/sendSms")
const User = require("../models/userModel")

// Upload single image
// exports.uploadUserImage = uploadMixOfImages("images")

// Image processing
// exports.resizeImage = asyncHandler(async (req, res, next) => {
//   // const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

//   if (req.file) {
//     await sharp(req.file.buffer)
//       .resize(600, 600)
//       .toFormat('jpeg')
//       .jpeg({ quality: 95 })
//       .toFile(`uploads/users/${filename}`);

//     // Save image into our db
//     req.body.images = filename;
//   }

//   next();
// });

// @desc    Get list of  reports
// @route   GET /api/v1/ reports
// @access  Private/Admin
exports.getReports = factory.getAll(Report)

// @desc    Get specific report by id
// @route   GET /api/v1/ reports/:id
// @access  Private/Admin
exports.getReport = factory.getOne(Report, "offers")

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

exports.deleteReport =
    asyncHandler(async (req, res, next) => {
        const { id } = req.params
        const document = await  Report.findByIdAndDelete(id)

        if (!document) {
            return next(new ApiError(`No document for this id ${id}`, 404))
        }
        if(  document.offers.length>0){
     document.offers.forEach(el=>{
        offer.findByIdAndDelete(el);
 })}
        // Trigger "remove" event when update document
        document.remove()
        res.status(204).send()
    })