const express = require('express');

const authService = require('../services/authService');

const {
  getBanners,
  getBanner,
  createBanner,
  updateBanner,
  deleteBanner,

} = require('../services/bannerService');
const { uploadMultipleImages } = require('../utils/uploadImages');
const {/* createBannerValidator,*/updateBannerValidator,deleteBannerValidator, getBannerValidator } = require('../utils/validators/bannerValidator');

const router = express.Router();

router
  .route('/')
  .get(getBanners)
  .post(
    authService.protect,
    authService.allowedTo('admin','superAdmin'),
    uploadMultipleImages,
   /* createBannerValidator,*/
    createBanner
  );
router
  .route('/:id')
  .get(getBannerValidator, getBanner)
  .put(
    authService.protect,
    authService.allowedTo('admin','superAdmin'),
    uploadMultipleImages,
    updateBannerValidator,
    updateBanner
  )
  .delete(
    authService.protect,
    authService.allowedTo('admin','superAdmin'),
    deleteBannerValidator,
    deleteBanner
  );

module.exports = router;
