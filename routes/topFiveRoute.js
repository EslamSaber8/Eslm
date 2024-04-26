const express = require("express")
const { getTopFive } = require("../services/topFiveService")
const authService = require("../services/authService")

const router = express.Router()

router.use(authService.protect)
router.get("/", getTopFive)
module.exports = router
