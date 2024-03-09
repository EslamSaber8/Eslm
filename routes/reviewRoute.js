const express = require('express');

const {
  createReviewValidator,
  updateReviewValidator,
  getReviewValidator,
  deleteReviewValidator,
} = require('../utils/validators/reviewValidator');

const {
  getReview,
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  createFilterObj,
  setProductIdAndUserIdToBody,
} = require('../services/reviewService');

const authService = require('../services/authService');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(createFilterObj, getReviews)
  .post(
    authService.protect,
    authService.allowedTo('workshop', 'driver','insurance'),
    setProductIdAndUserIdToBody,
    createReviewValidator,
    createReview
  );
router
  .route('/:id')
  .get(getReviewValidator, getReview)
  .put(
    authService.protect,
    authService.allowedTo('workshop', 'driver','insurance'),
    updateReviewValidator,
    updateReview
  )
  .delete(
    authService.protect,
    authService.allowedTo('workshop', 'driver','insurance','admin','superAdmin'),
    deleteReviewValidator,
    deleteReview
  );

module.exports = router;
