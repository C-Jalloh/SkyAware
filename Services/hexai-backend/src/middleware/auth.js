import { getUserById, verifyToken } from "../services/auth.js";

/**
 * Middleware to authenticate JWT token
 */
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }

  // Get user data (this is async!)
  const user = await getUserById(decoded.userId);
  if (!user) {
    return res.status(403).json({
      success: false,
      message: 'User not found'
    });
  }

  req.user = user;
  next();
}

/**
 * Optional authentication - doesn't fail if no token
 */
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      const user = await getUserById(decoded.userId);
      if (user) {
        req.user = user;
      }
    }
  }

  next();
}