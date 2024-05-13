const express = require("express")
const { createCouponValidator, getCouponValidator, updateCouponValidator, deleteProductValidator } = require("../utils/validators/couponValidator")
const { getCoupon, getCoupons, createCoupon, updateCoupon, deleteCoupon } = require("../services/couponService")

const authService = require("../services/authService")

const router = express.Router()

router.use(authService.protect, authService.allowedTo("admin", "superAdmin"))

router.route("/").get(getCoupons).post(createCouponValidator, createCoupon)
router.route("/:id").get(getCouponValidator, getCoupon).put(updateCouponValidator, updateCoupon).delete(deleteProductValidator, deleteCoupon)

module.exports = router
