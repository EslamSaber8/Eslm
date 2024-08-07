const asyncHandler = require("express-async-handler")
const factory = require("./handlersFactory")
const ApiError = require("../utils/apiError")

const User = require("../models/userModel")
const Product = require("../models/productModel")
const Cart = require("../models/cartModel")
const Order = require("../models/orderModel")

// @desc    create cash order
// @route   POST /api/v1/orders/cartId
// @access  Protected/User
exports.createCashOrder = asyncHandler(async (req, res, next) => {
    // app settings
    const taxPrice = 0
    const shippingPrice = 0

    // 1) Get cart depend on cartId
    const cart = await Cart.findById(req.params.cartId)
    if (!cart) {
        return next(new ApiError(`There is no such cart with id ${req.params.cartId}`, 404))
    }

    // 2) Get order price depend on cart price "Check if coupon apply"
    const cartPrice = cart.totalPriceAfterDiscount ? cart.totalPriceAfterDiscount : cart.totalCartPrice

    const totalOrderPrice = cartPrice + taxPrice + shippingPrice

    // 3) Create order with default paymentMethodType cash
    const order = await Order.create({
        user: req.user._id,
        cartItems: cart.cartItems,
        shippingAddress: req.body.shippingAddress,
        totalOrderPrice,
    })

    // 4) After creating order, decrement product quantity, increment product sold
    if (order) {
        const bulkOption = cart.cartItems.map((item) => ({
            updateOne: {
                filter: { _id: item.product },
                update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
            },
        }))
        await Product.bulkWrite(bulkOption, {})

        // 5) Clear cart depend on cartId
        await Cart.findByIdAndDelete(req.params.cartId)
    }

    res.status(201).json({ status: "success", data: order })
})

exports.filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
    if (req.user.role === "workshop") req.filterObj = { user: req.user._id }
    next()
})
// @desc    Get all orders
// @route   POST /api/v1/orders
// @access  Protected/User-Admin-Manager
exports.findAllOrders = factory.getAll(Order)

// @desc    Get all orders
// @route   POST /api/v1/orders
// @access  Protected/User-Admin-Manager
exports.findSpecificOrder = factory.getOne(Order)

// @desc    Update order paid status to paid
// @route   PUT /api/v1/orders/:id/pay
// @access  Protected/Admin-Manager
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
    if (!order) {
        return next(new ApiError(`There is no such a order with this id:${req.params.id}`, 404))
    }

    // update order to paid
    order.isPaid = true
    order.paidAt = Date.now()
    order.isDelivered = true
    order.deliveredAt = Date.now()

    const updatedOrder = await order.save()
    res.status(200).json({ status: "success", data: updatedOrder })
})

exports.lists = asyncHandler(async (req, res, next) => {
    const result = []
    const orders = await Order.find()

    orders.forEach((order) => {
        const orderData = {
            shippingAddress: order.shippingAddress,
            user: order.user,
            cartItems: [],
            totalPrice: 0,
            id: order._id,
        }

        order.cartItems.forEach((cartItem) => {
            // Check if cartItem.product exists and has a createdBy property
            if (cartItem.product && cartItem.product.createdBy && cartItem.product.createdBy._id.toString() === req.user._id.toString()) {
                const itemPrice = cartItem.product.price * cartItem.quantity
                orderData.cartItems.push({ cartItem: cartItem.product, totalPrice: itemPrice })
                orderData.totalPrice += itemPrice
            }
        })

        if (orderData.cartItems.length > 0) {
            result.push(orderData)
        }
    })

    res.status(200).json({ status: "success", data: result })
})

exports.updateVendor = asyncHandler(async (req, res, next) => {
    const orders = await Order.findById(req.params.id)
    orders.cartItems.forEach(async (cartItem) => {
        if (cartItem.product && cartItem.product.createdBy && cartItem.product.createdBy._id.toString() === req.user._id.toString()) {
            // update order status
            return (cartItem.status = req.body.status)
        }
    })
    await orders.save()
    res.status(200).json({ status: "success", data: "status change success" })
})

