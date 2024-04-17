const asyncHandler = require("express-async-handler")
const factory = require("./handlersFactory")
const Product = require("../models/productModel")

// @desc    Get list of products
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = factory.getAll(Product, "Products")

// @desc    Get specific product by id
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = factory.getOne(Product, "reviews")

// @desc    Create product
// @route   POST  /api/v1/products
// @access  Private
exports.createProduct = factory.createOne(Product)
// exports.createProduct =
// @desc    Update specific product
// @route   PUT /api/v1/products/:id
// @access  Private
exports.updateProduct = factory.updateOne(Product)

// @desc    Delete specific product
// @route   DELETE /api/v1/products/:id
// @access  Private
exports.deleteProduct = factory.deleteOne(Product)

exports.netAndSales = asyncHandler(async (req, res) => {
    const stats = await Product.find({ createdBy: req.user.id })
    let net = 0
    let sold = 0

    if (!stats || stats.length === 0) {
        res.status(200).json({
            status: "success",
            data: {
                sales: 0,
                net: 0,
            },
        })
    }
    stats.forEach((stat) => {
        net += stat.price * stat.sold
        sold += stat.sold
    })

    res.status(200).json({
        status: "success",
        data: {
            net,
            sold,
        },
    })
})
