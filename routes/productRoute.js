const express = require('express');
const {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require('../utils/validators/productValidator');

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  resizeProductImages,
  netAndSales,
} = require('../services/productService');
const authService = require('../services/authService');
const reviewsRoute = require('./reviewRoute');
const { uploadMultipleImages } = require('../utils/uploadImages');

const router = express.Router();

// POST   /products/jkshjhsdjh2332n/reviews
// GET    /products/jkshjhsdjh2332n/reviews
// GET    /products/jkshjhsdjh2332n/reviews/87487sfww3
router.get('/netAndSales', authService.protect, authService.allowedTo('admin','superAdmin',"vendor"), netAndSales);

router.use('/:productId/reviews', reviewsRoute);

router
  .route('/')
  .get(getProducts)
  .post(
    authService.protect,
    authService.allowedTo('admin','superAdmin',"vendor"),
    uploadMultipleImages,
    createProductValidator,
    createProduct
  );
router
  .route('/:id')
  .get(getProductValidator, getProduct)
  .put(
    authService.protect,
    authService.allowedTo('admin','superAdmin',"vendor"),
    uploadMultipleImages,
    updateProductValidator,
    updateProduct
  )
  .delete(
    authService.protect,
    authService.allowedTo('admin','superAdmin',"vendor"),
    deleteProductValidator,
    deleteProduct
  );



module.exports = router;
