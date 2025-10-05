import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getAirNowData } from '../services/airnowService.js';
import { getTempoData } from '../services/tempoService.js';
import { saveUserLocation, removeUserLocation } from '../services/auth.js';

const router = Router();

// All routes in this file require authentication
router.use(authenticateToken);

/**
 * Get complete user profile (excluding password)
 */
router.get('/profile', async (req, res) => {
  try {
    const user = req.user;
    
    // Calculate some additional profile stats
    const profileStats = {
      totalSavedLocations: user.savedLocations?.length || 0,
      accountAge: user.createdAt ? Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) : 0,
      lastActiveDate: user.lastLogin || user.createdAt
    };

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        savedLocations: user.savedLocations || [],
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        updatedAt: user.updatedAt,
        // Add profile statistics
        stats: profileStats,
        // Add user preferences if they exist
        preferences: user.preferences || {
          units: 'imperial',
          notifications: false,
          theme: 'light'
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
});

/**
 * Update user profile
 */
router.put('/profile', async (req, res) => {
  try {
    const { name, preferences } = req.body;
    const userId = req.user.id;

    // Validation
    if (name && name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters long'
      });
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (preferences) updateData.preferences = preferences;
    updateData.updatedAt = new Date();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password'); // Exclude password

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        savedLocations: updatedUser.savedLocations || [],
        createdAt: updatedUser.createdAt,
        lastLogin: updatedUser.lastLogin,
        updatedAt: updatedUser.updatedAt,
        preferences: updatedUser.preferences
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

/**
 * Get user's saved locations with current AQI data
 */
router.get('/locations', async (req, res) => {
  try {
    const user = req.user;
    
    if (!user.savedLocations || user.savedLocations.length === 0) {
      return res.json({
        success: true,
        locations: [],
        message: 'No saved locations found'
      });
    }

    // Get current AQI data for each saved location
    const locationsWithAqi = await Promise.all(
      user.savedLocations.map(async (location) => {
        try {
          const [airNowData, tempoData] = await Promise.all([
            getAirNowData(location.lat, location.lon),
            getTempoData(location.lat, location.lon)
          ]);

          return {
            id: location._id,
            name: location.name,
            lat: location.lat,
            lon: location.lon,
            city: location.city,
            state: location.state,
            country: location.country,
            createdAt: location.createdAt,
            updatedAt: location.updatedAt,
            current_aqi: {
              airnow: airNowData.success ? {
                aqi: airNowData.aqi,
                category: airNowData.category,
                pollutant: airNowData.pollutant,
                timestamp: airNowData.timestamp
              } : null,
              tempo: tempoData.success ? {
                aqi: tempoData.aqi,
                category: tempoData.category,
                distance_km: tempoData.distance_km,
                timestamp: tempoData.timestamp
              } : null
            }
          };
        } catch (error) {
          console.error(`Error fetching AQI for location ${location.name}:`, error);
          return {
            id: location._id,
            name: location.name,
            lat: location.lat,
            lon: location.lon,
            city: location.city,
            state: location.state,
            country: location.country,
            createdAt: location.createdAt,
            updatedAt: location.updatedAt,
            current_aqi: {
              airnow: null,
              tempo: null,
              error: 'Failed to fetch current AQI data'
            }
          };
        }
      })
    );

    res.json({
      success: true,
      locations: locationsWithAqi,
      total_count: locationsWithAqi.length
    });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch saved locations'
    });
  }
});

/**
 * Save a new location
 */
/**
 * Save a new location
 */
router.post('/locations', async (req, res) => {
  try {
    const { name, lat, lon, city, state, country } = req.body;

    // Validation - only require name, lat, lon
    if (!name || lat === undefined || lon === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, latitude, and longitude are required'
      });
    }

    if (typeof lat !== 'number' || typeof lon !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude must be numbers'
      });
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates'
      });
    }

    // Create location object with only required fields
    const location = {
      name: name.trim(),
      lat: Number(lat),
      lon: Number(lon)
    };

    // Add optional fields only if provided
    if (city) location.city = city.trim();
    if (state) location.state = state.trim();
    if (country) location.country = country.trim();

    const result = await saveUserLocation(req.user.id, location);

    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Location saved successfully',
        location: result.location,
        savedLocations: result.savedLocations
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Save location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save location'
    });
  }
});

/**
 * Remove a saved location
 */
router.delete('/locations/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;

    if (!locationId) {
      return res.status(400).json({
        success: false,
        message: 'Location ID is required'
      });
    }

    const result = await removeUserLocation(req.user.id, locationId);

    if (result.success) {
      res.json({
        success: true,
        message: 'Location removed successfully',
        savedLocations: result.savedLocations
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Remove location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove location'
    });
  }
});

export default router;