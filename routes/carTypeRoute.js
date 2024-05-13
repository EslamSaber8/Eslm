const express = require("express")
const { createCarTypeValidator, deleteCarTypeValidator, updateCarTypeValidator, getCarTypeValidator } = require("../utils/validators/carTypeValidator")
const { createCarType, getCarTypes, getCarType, updateCarType, deleteCarType } = require("../services/carTypeService")
const authService = require("../services/authService")

const router = express.Router()

router
    .route("/")
    .post(authService.protect, authService.allowedTo("admin", "superAdmin"), createCarTypeValidator, createCarType)
    .get(authService.protect, getCarTypes)

router
    .route("/:id")
    .get(authService.protect, getCarTypeValidator,getCarType)
    .put(authService.protect, authService.allowedTo("admin", "superAdmin"), updateCarTypeValidator, updateCarType)
    .delete(authService.protect, authService.allowedTo("admin", "superAdmin"), deleteCarTypeValidator, deleteCarType)

module.exports = router
