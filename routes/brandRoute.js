const express = require('express');
const {
  getBrandValidator,
  createBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
} = require('../utils/validators/brandValidator');

const authService = require('../services/authService');

const {
  getBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,

} = require('../services/brandService');
const { uploadMultipleImages } = require('../utils/uploadImages');

const router = express.Router();

router
  .route('/')
  .get(getBrands)
  .post(
    authService.protect,
    authService.allowedTo('admin','superAdmin'),
    uploadMultipleImages,
    createBrandValidator,
    createBrand
  );
router
  .route('/:id')
  .get(getBrandValidator, getBrand)
  .put(
    authService.protect,
    authService.allowedTo('admin','superAdmin'),
    uploadMultipleImages,
    updateBrandValidator,
    updateBrand
  )
  .delete(
    authService.protect,
    authService.allowedTo('admin','superAdmin'),
    deleteBrandValidator,
    deleteBrand
  );

module.exports = router;
