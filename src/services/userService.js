const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Register a new user
const registerUser = async (userData) => {
  // Check if user with email already exists
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }
  
  // Create new user
  const user = new User(userData);
  await user.save();
  
  // Generate token
  const token = generateToken(user._id);
  
  return {
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
    },
    token,
  };
};

// Login user
const loginUser = async (email, password) => {
  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }
  
  // Generate token
  const token = generateToken(user._id);
  
  return {
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
    },
    token,
  };
};

// Get user profile
const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    name: user.name,
    location: user.location,
    preferredCategories: user.preferredCategories,
    preferredLanguage: user.preferredLanguage,
    createdAt: user.createdAt,
  };
};

// Update user profile
const updateUserProfile = async (userId, updates) => {
  // Don't allow password updates through this function
  if (updates.password) {
    delete updates.password;
  }
  
  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    name: user.name,
    location: user.location,
    preferredCategories: user.preferredCategories,
    preferredLanguage: user.preferredLanguage,
    updatedAt: user.updatedAt,
  };
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
