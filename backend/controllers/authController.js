const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

// @desc Register a new user
// @route POST /api/auth/register
// @access Public
const registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    try {
          const existingUser = await User.findOne({ email });
          if (existingUser) {
                  return res.status(400).json({ message: 'User already exists with this email' });
          }
          const user = await User.create({ name, email, password });
          res.status(201).json({
                  _id: user._id,
                  name: user.name,
                  email: user.email,
                  token: generateToken(user._id),
          });
    } catch (error) {
          console.error('Register error:', error.message);
          res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc Login user
// @route POST /api/auth/login
// @access Public
const loginUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
          const user = await User.findOne({ email }).select('+password');
          if (!user) {
                  return res.status(401).json({ message: 'Invalid email or password' });
          }
          const isMatch = await user.matchPassword(password);
          if (!isMatch) {
                  return res.status(401).json({ message: 'Invalid email or password' });
          }
          res.json({
                  _id: user._id,
                  name: user.name,
                  email: user.email,
                  token: generateToken(user._id),
          });
    } catch (error) {
          console.error('Login error:', error.message);
          res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc Get logged-in user profile
// @route GET /api/auth/me
// @access Private
const getMe = async (req, res) => {
    try {
          const user = await User.findById(req.user._id);
          res.json({ _id: user._id, name: user.name, email: user.email, createdAt: user.createdAt });
    } catch (error) {
          res.status(500).json({ message: 'Server error' });
    }
};

// @desc Update user profile (name and/or email)
// @route PUT /api/auth/profile
// @access Private
const updateProfile = async (req, res) => {
    try {
          const { name, email } = req.body;
          const user = await User.findById(req.user._id);

      if (!user) {
              return res.status(404).json({ message: 'User not found' });
      }

      // Check if new email is already taken by another user
      if (email && email !== user.email) {
              const emailTaken = await User.findOne({ email });
              if (emailTaken) {
                        return res.status(400).json({ message: 'Email is already in use by another account' });
              }
              user.email = email;
      }

      if (name) user.name = name;

      const updatedUser = await user.save();
          res.json({
                  _id: updatedUser._id,
                  name: updatedUser.name,
                  email: updatedUser.email,
                  createdAt: updatedUser.createdAt,
          });
    } catch (error) {
          console.error('Update profile error:', error.message);
          res.status(500).json({ message: 'Server error while updating profile' });
    }
};

// @desc Change user password
// @route PUT /api/auth/password
// @access Private
const changePassword = async (req, res) => {
    try {
          const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
              return res.status(400).json({ message: 'Current password and new password are required' });
      }

      if (newPassword.length < 6) {
              return res.status(400).json({ message: 'New password must be at least 6 characters' });
      }

      const user = await User.findById(req.user._id).select('+password');
          if (!user) {
                  return res.status(404).json({ message: 'User not found' });
          }

      const isMatch = await user.matchPassword(currentPassword);
          if (!isMatch) {
                  return res.status(401).json({ message: 'Current password is incorrect' });
          }

      user.password = newPassword;
          await user.save();

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
          console.error('Change password error:', error.message);
          res.status(500).json({ message: 'Server error while changing password' });
    }
};

module.exports = { registerUser, loginUser, getMe, updateProfile, changePassword };
