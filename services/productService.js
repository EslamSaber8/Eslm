const asyncHandler = require("express-async-handler")
const factory = require("./handlersFactory")
const Product = require("../models/productModel")
const ApiError = require("../utils/apiError")

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

exports.updateProducts = asyncHandler(async (req, res) => {
    const { products, Discount, fixed } = req.body
    if (Discount && fixed) {
        return next(new ApiError(`You can't set both fixed and percentage discount`, 400))
    }

    if (!products || products.length === 0) {
        return next(new ApiError(`No products found`, 400))
    }

    products.forEach(async (product) => {
        const update = await Product.findById(product._id).populate("createdBy")
        if (update.createdBy.id !== req.user.id) {
            if (Discount) {
                update.Discount = Discount
                update.priceAfterDiscount = product.price - (product.price * Discount) / 100
            } else if (fixed) {
                update.Discount = fixed
                update.priceAfterDiscount = product.price - fixed
            }
            await update.save()
        }
    })
    res.status(200).json({
        status: "success",
        message: "Products updated successfully",
    })
})
