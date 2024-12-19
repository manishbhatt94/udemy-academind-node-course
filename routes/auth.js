const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.get('/reset', authController.getReset);

router.get('/reset/:token', authController.getNewPassword);

router.post(
  '/login',
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password', 'Invalid password').isLength({ min: 5 }).isAlphanumeric(),
  authController.postLogin
);

router.post('/logout', authController.postLogout);

router.post(
  '/signup',
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .custom((value) => {
      return User.findOne({ email: value }).then((existingUser) => {
        if (existingUser) {
          return Promise.reject(
            'An account with this email already exists. Please pick a different email address'
          );
        }
      });
    }),
  body('password', 'Please enter a alphanumeric password atleast 5 characters long')
    .isLength({ min: 5 })
    .isAlphanumeric(),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords must match');
    }
    return true;
  }),
  authController.postSignup
);

router.post('/reset', authController.postReset);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
