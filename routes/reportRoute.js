const express = require("express")
const router = express.Router()
const authService = require("../services/authService")
const { getReports, getReport, createReport, updateReport, deleteReport, uploadUserImage } = require("../services/reportService")
const { getReportValidator, createReportValidator, updateReportValidator, deleteReportValidator } = require("../utils/validators/reportValidator")
router.use(authService.protect)
router.use(authService.allowedTo("admin", "superAdmin", "insurance"))
router.route("/").get(authService.allowedTo("admin", "superAdmin"), getReports).post(uploadUserImage, createReportValidator, createReport)

//resizeImage,
router
    .route("/:id")
    .get(getReportValidator, getReport)
    .put(uploadUserImage, updateReportValidator, updateReport)
    .delete(deleteReportValidator, deleteReport)

module.exports = router
