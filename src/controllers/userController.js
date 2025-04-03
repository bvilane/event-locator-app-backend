const { validationResult } = require('express-validator');
const userService = require('../services/userService');

// Register a new user
const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const result = await userService.registerUser(req.body);
    res.status(201).json({
      message: req.t('users.registered'),
      ...result,
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, password } = req.body;
    const result = await userService.loginUser(email, password);
    res.status(200).json({
      message: req.t('users.loggedIn'),
      ...result,
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const result = await userService.getUserProfile(req.user._id);
    res.status(200).json(result);
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// Update current user profile
const updateProfile = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const result = await userService.updateUserProfile(req.user._id, req.body);
    res.status(200).json({
      message: 'Profile updated successfully',
      user: result,
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
};
