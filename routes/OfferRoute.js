const express = require('express');
const router = express.Router({ mergeParams: true });
const authService = require('../services/authService');
const {
getOffers,
getOffer,
createOffer,
updateOffer,
deleteOffer,} = require('../services/OfferService');
const {getOfferValidator ,createOfferValidator,updateOfferValidator,deleteOfferValidator }= require('../utils/validators/OfferValidator');
router.use(authService.protect); 
// router.use(authService.allowedTo('admin', 'superAdmin'));
router
  .route('/')
  .get(authService.allowedTo('admin', 'superAdmin'), getOffers)
  .post(authService.allowedTo('driver','workshop',"vendor"),createOfferValidator, createOffer);
router
  .route('/:id')
  .get(getOfferValidator,getOffer)
  .put(authService.protect,authService.allowedTo('driver','workshop',"vendor"), updateOfferValidator, updateOffer)
  .delete(
    authService.protect,
    authService.allowedTo('driver','workshop',"vendor",'admin', 'superAdmin'),
    deleteOfferValidator,
    deleteOffer
  );

module.exports = router;

