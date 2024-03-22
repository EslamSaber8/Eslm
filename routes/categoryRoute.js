const express = require('express');

const {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} = require('../utils/validators/categoryValidator');

const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../services/categoryService');

const authService = require('../services/authService');
const { uploadMultipleImages } = require('../utils/uploadImages');



const router = express.Router();



router
  .route('/')
  .get(getCategories)
  .post(
    authService.protect,
    authService.allowedTo('admin','superAdmin'),
    uploadMultipleImages,
    createCategoryValidator,
    createCategory
  );
router
  .route('/:id')
  .get(getCategoryValidator, getCategory)
  .put(
    authService.protect,
    authService.allowedTo('admin','superAdmin'),
    uploadMultipleImages,
    updateCategoryValidator,
    updateCategory
  )
  .delete(
    authService.protect,
    authService.allowedTo('admin','superAdmin'),
    deleteCategoryValidator,
    deleteCategory
  );

module.exports = router;
