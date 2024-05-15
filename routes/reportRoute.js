const express = require("express")
const router = express.Router()
const authService = require("../services/authService")
const {
    getReports,
    getReport,
    createReport,
    updateReport,
    deleteReport,
    getReportsForWorkshops,
    acceptWorkshopOffer,
    acceptDriverOffer,
    workshopFinishFixing,
    driverFinishDelivery,
    completeReport,
    acceptVendorOffer,
    vendorFinishDelivery,
} = require("../services/reportService")
const { getReportValidator, createReportValidator, updateReportValidator, deleteReportValidator } = require("../utils/validators/reportValidator")
const { uploadMultipleImages } = require("../utils/uploadImages")
router.use(authService.protect)
router.get("/workshop", authService.allowedTo("workshop"), getReportsForWorkshops)

//resizeImage,
router
    .route("/:id")
    .get(getReportValidator, getReport)
    .put(authService.allowedTo("admin", "superAdmin", "insurance"), uploadMultipleImages, updateReportValidator, updateReport)
    .delete(authService.allowedTo("admin", "superAdmin", "insurance"), deleteReportValidator, deleteReport)

router
    .route("/")
    .get(getReports)
    .post(authService.allowedTo("admin", "superAdmin", "insurance"), uploadMultipleImages, createReportValidator, createReport)
router
    .route("/workshop/:id")
    .post(authService.allowedTo("admin", "superAdmin", "insurance"), acceptWorkshopOffer)
    .put(authService.allowedTo("admin", "superAdmin", "insurance", "workshop"), uploadMultipleImages,workshopFinishFixing)
router
    .route("/driver/:id")
    .post(authService.allowedTo("admin", "superAdmin", "insurance"), acceptDriverOffer)
    .put(authService.allowedTo("admin", "superAdmin", "insurance", "driver"), uploadMultipleImages, driverFinishDelivery)

router
    .route("/vendor/:id")
    .post(authService.allowedTo("admin", "superAdmin", "insurance"), acceptVendorOffer)
    .put(authService.allowedTo("admin", "superAdmin", "insurance", "vendor"), vendorFinishDelivery)

router.route("/complete/:id").post(authService.allowedTo("admin", "superAdmin", "insurance"), completeReport)

module.exports = router
