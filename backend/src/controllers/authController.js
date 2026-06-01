const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const env = require('../config/environment');
const { User } = require('../models');

const registerSchema = Joi.object({
  username: Joi.string().trim().min(3).max(100).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(8).required(),
  full_name: Joi.string().trim().max(255).allow('', null),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required(),
});

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRE }
  );
}

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  // Keep the payload stable for frontend usage and remove password hashes.
  const { password, ...safeUser } = user;
  return safeUser;
}

async function register(req, res) {
  const { error, value } = registerSchema.validate(req.body, { abortEarly: false, stripUnknown: true });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.details.map((detail) => detail.message),
    });
  }

  const { username, email, password, full_name } = value;

  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'Email already exists',
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const createdUser = await User.createUser({
    username,
    email,
    password: hashedPassword,
    fullName: full_name,
    role: 'User',
  });

  const token = createToken(createdUser);

  return res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: sanitizeUser(createdUser),
  });
}

async function login(req, res) {
  const { error, value } = loginSchema.validate(req.body, { abortEarly: false, stripUnknown: true });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.details.map((detail) => detail.message),
    });
  }

  const { email, password } = value;

  const user = await User.findByEmail(email);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  const token = createToken(user);

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user: sanitizeUser(user),
  });
}

function logout(req, res) {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
}

async function getCurrentUser(req, res) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  const currentUser = req.user.id ? await User.findById(req.user.id) : req.user;

  if (!currentUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  return res.status(200).json({
    success: true,
    user: sanitizeUser(currentUser),
  });
}

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
};