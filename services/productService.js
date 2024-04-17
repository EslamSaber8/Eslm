
const asyncHandler = require("express-async-handler")
const factory = require('./handlersFactory');
const Product = require('../models/productModel');
const { query } = require("express");


// @desc    Get list of products
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = factory.getAll(Product, 'Products');

// @desc    Get specific product by id
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = factory.getOne(Product, 'reviews');

// @desc    Create product
// @route   POST  /api/v1/products
// @access  Private
exports.createProduct = factory.createOne(Product);
// exports.createProduct = 
// @desc    Update specific product
// @route   PUT /api/v1/products/:id
// @access  Private
exports.updateProduct = factory.updateOne(Product);

// @desc    Delete specific product
// @route   DELETE /api/v1/products/:id
// @access  Private
exports.deleteProduct = factory.deleteOne(Product);




// exports.applyDiscount = asyncHandler(async (req, res, next) => {
//         const { id } = req.params
//         // 1) Build query
//         let product = Product.findById(id)  
//         dis=req.body.dis;
//         const document = await product
//         if (!document) {
//             return next(new ApiError(`No product for this id ${id}`, 404))
//         }
//         res.status(200).json({ data: document })
//     })

//     // 3) Calculate price after priceAfterDiscount
//     const PriceAfterDiscount = (product.price - (product.price * dis) / 100).toFixed(2) // 99.23

//     product.PriceAfterDiscount =PriceAfterDiscount
//     await product.save()

//     res.status(200).json({
//         status: "success",
//         data: product,
//     })
