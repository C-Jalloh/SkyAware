import jwt from 'jsonwebtoken';
import User from '../data/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT token
 */
export function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Register a new user
 */
export async function registerUser(name, email, password) {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return {
        success: false,
        message: 'User with this email already exists'
      };
    }

    // Create new user
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password, // Will be hashed by the pre-save hook
      savedLocations: []
    });

    await newUser.save();

    // Generate token
    const token = generateToken(newUser._id);

    return {
      success: true,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        savedLocations: newUser.savedLocations,
        createdAt: newUser.createdAt
      }
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: 'Registration failed',
      error: error.message
    };
  }
}

/**
 * Login user
 */
export async function loginUser(email, password) {
  try {
    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    return {
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        savedLocations: user.savedLocations,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Login failed',
      error: error.message
    };
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId) {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return null;
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      savedLocations: user.savedLocations,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    };
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

/**
 * Save user location
 */
export async function saveUserLocation(userId, location) {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // Check if location already exists
    const existingLocationIndex = user.savedLocations.findIndex(
      loc => loc.name === location.name || 
             (Math.abs(loc.lat - location.lat) < 0.01 && Math.abs(loc.lon - location.lon) < 0.01)
    );

    if (existingLocationIndex !== -1) {
      // Update existing location
      user.savedLocations[existingLocationIndex] = {
        ...user.savedLocations[existingLocationIndex].toObject(),
        ...location,
        updatedAt: new Date()
      };
    } else {
      // Add new location
      user.savedLocations.push({
        ...location,
        createdAt: new Date()
      });
    }

    await user.save();

    return {
      success: true,
      savedLocations: user.savedLocations
    };
  } catch (error) {
    console.error('Save location error:', error);
    return {
      success: false,
      message: 'Failed to save location',
      error: error.message
    };
  }
}

/**
 * Remove user location
 */
export async function removeUserLocation(userId, locationId) {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    user.savedLocations = user.savedLocations.filter(loc => loc._id.toString() !== locationId);
    await user.save();

    return {
      success: true,
      savedLocations: user.savedLocations
    };
  } catch (error) {
    console.error('Remove location error:', error);
    return {
      success: false,
      message: 'Failed to remove location',
      error: error.message
    };
  }
}