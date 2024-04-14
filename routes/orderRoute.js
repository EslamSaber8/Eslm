const express = require('express');
const {
  createCashOrder,
  findAllOrders,
  findSpecificOrder,
  filterOrderForLoggedUser,
  updateOrderToPaid,
} = require('../services/orderService');

const authService = require('../services/authService');

const router = express.Router();

router.use(authService.protect);
router.route('/:cartId').post(authService.allowedTo('workshop'), createCashOrder);
router.get(
  '/',
  authService.allowedTo('workshop', 'admin', 'superAdmin'),
  filterOrderForLoggedUser,
  findAllOrders
);
router.get('/:id', findSpecificOrder);

router.put(
  '/:id/pay',
  authService.allowedTo('admin', 'superAdmin'),
  updateOrderToPaid
);

module.exports = router;
