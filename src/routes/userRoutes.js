const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { auth } = require('../middleware');

const router = express.Router();

// Register a new user
router.post(
  '/register',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('name').notEmpty().withMessage('Name is required'),
  ],
  userController.register
);

// Login user
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  userController.login
);

// Get current user profile
router.get('/profile', auth, userController.getProfile);

// Update current user profile
router.put(
  '/profile',
  auth,
  [
    body('username').optional().notEmpty().withMessage('Username cannot be empty'),
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('preferredLanguage')
      .optional()
      .isIn(['en', 'fr'])
      .withMessage('Preferred language must be either en or fr'),
  ],
  userController.updateProfile
);

module.exports = router;
