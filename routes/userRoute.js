const express = require('express');
const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  updateLoggedUserValidator,
} = require('../utils/validators/userValidator');

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadUserImage,
  changeUserPassword,
  changeUserRole ,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUserData,
} = require('../services/userService');

const authService = require('../services/authService');
const { uploadMultipleImages } = require('../utils/uploadImages');

const router = express.Router();

router.use(authService.protect);

router.get('/getMe', getLoggedUserData, getUser);
router.put('/changeMyPassword', updateLoggedUserPassword);
router.put('/updateMe',uploadMultipleImages, updateLoggedUserValidator, updateLoggedUserData);
router.delete('/deleteMe', deleteLoggedUserData);

// Admin
 router.use(authService.allowedTo('admin', 'superAdmin'));
router.put(
  '/changePassword/:id',
  changeUserPasswordValidator,
  changeUserPassword
);
router
  .route('/')
  .get(getUsers)
  .post(uploadMultipleImages,  createUserValidator, createUser);
router
  .route('/:id')
  .get(getUserValidator, getUser)
  .put(uploadMultipleImages,  updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

  router.use(authService.allowedTo('superAdmin'));
   router.put(
    '/changeUserRole/:id',
    changeUserRole
  );
module.exports = router;
