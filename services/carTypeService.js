const asyncHandler = require("express-async-handler")
const carTypeModel = require("../models/carTypeModel")

exports.createCarType = asyncHandler(async (req, res, next) => {
    const carType = await carTypeModel.create(req.body)

    res.status(201).json({
        status: "success",
        message: "Car Type created successfully",
        data: carType,
    })
})

exports.getCarTypes = asyncHandler(async (req, res, next) => {
    const carTypes = await carTypeModel.find()

    res.status(200).json({
        status: "success",
        data: carTypes,
    })
})

exports.getCarType = asyncHandler(async (req, res, next) => {
    const carType = await carTypeModel.findById(req.params.id)

    if (!carType) {
        return next(new ApiError(`Car Type not found with id of ${req.params.id}`, 404))
    }

    res.status(200).json({
        status: "success",
        data: carType,
    })
})

exports.updateCarType = asyncHandler(async (req, res, next) => {
    const carType = await carTypeModel.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    })

    if (!carType) {
        return next(new ApiError(`Car Type not found with id of ${req.params.id}`, 404))
    }

    res.status(200).json({
        status: "success",
        message: "Car Type updated successfully",
        data: carType,
    })
})

exports.deleteCarType = asyncHandler(async (req, res, next) => {
    const carType = await carTypeModel.findByIdAndDelete(req.params.id)

    if (!carType) {
        return next(new ApiError(`Car Type not found with id of ${req.params.id}`, 404))
    }

    res.status(204).json({
        status: "success",
        message: "Car Type deleted successfully",
        data: null,
    })
})
