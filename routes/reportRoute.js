const express = require("express")
const router = express.Router()
const authService = require("../services/authService")
const { getReports, getReport, createReport, updateReport, deleteReport, getReportsForWorkshops } = require("../services/reportService")
const { getReportValidator, createReportValidator, updateReportValidator, deleteReportValidator } = require("../utils/validators/reportValidator")
const { uploadMultipleImages } = require("../utils/uploadImages")
router.use(authService.protect)
router.get("/workshop", authService.allowedTo("workshop"), getReportsForWorkshops)
router.use(authService.allowedTo("admin", "superAdmin", "insurance"))
router.route("/").get(authService.allowedTo("admin", "superAdmin"), getReports).post(uploadMultipleImages, createReportValidator, createReport)

//resizeImage,
router
    .route("/:id")
    .get(getReportValidator, getReport)
    .put(uploadMultipleImages, updateReportValidator, updateReport)
    .delete(deleteReportValidator, deleteReport)

module.exports = router
