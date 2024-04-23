const express = require("express")
const router = express.Router()
const authService = require("../services/authService")
const { getReports, getReport, createReport, updateReport, deleteReport, getReportsForWorkshops, acceptWorkshopOffer, acceptDriverOffer } = require("../services/reportService")
const { getReportValidator, createReportValidator, updateReportValidator, deleteReportValidator } = require("../utils/validators/reportValidator")
const { uploadMultipleImages } = require("../utils/uploadImages")
router.use(authService.protect)
router.get("/workshop", authService.allowedTo("workshop"), getReportsForWorkshops)
//resizeImage,
router
    .route("/:id")
    .get(getReportValidator, getReport)
    .put(authService.allowedTo("admin", "superAdmin", "insurance"),uploadMultipleImages, updateReportValidator, updateReport)
    .delete(authService.allowedTo("admin", "superAdmin", "insurance"),deleteReportValidator, deleteReport)

router.route("/").get(getReports).post(authService.allowedTo("admin", "superAdmin", "insurance"),uploadMultipleImages, createReportValidator, createReport)
router.route("/workshop/:id").post(authService.allowedTo("insurance"), acceptWorkshopOffer)
router.route("/driver/:id").post(authService.allowedTo("insurance"), acceptDriverOffer)


module.exports = router
