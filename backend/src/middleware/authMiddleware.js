const jwt = require('jsonwebtoken');

const env = require('../config/environment');

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No token provided',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
}

/**
 * Optional authentication — sets req.user if a valid Bearer token is present,
 * but does NOT reject the request when the token is missing or invalid.
 * Use for endpoints accessible by both guests and authenticated users.
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, env.JWT_SECRET);
    } catch {
      // Token present but invalid — treat as guest, don't reject
      req.user = null;
    }
  } else {
    req.user = null;
  }

  return next();
}

module.exports = {
  authenticateToken,
  optionalAuth,
};