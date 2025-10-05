import { Router } from 'express';
import { generateHealthAdvice } from '../services/healthAdviceService.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// Apply optional authentication to all routes
router.use(optionalAuth);

/**
 * Health check endpoint
 */
router.get('/', (req, res) => {
  res.json({ 
    status: "ok", 
    time: new Date().toISOString(),
    service: "Health Advice API",
    endpoints: {
      advice: "POST /advice - Get health advice based on air quality data",
      categories: "GET /categories - Get AQI health categories"
    }
  });
});

/**
 * Generate health advice based on air quality data
 */
router.post('/advice', async (req, res) => {
  try {
    const { air_quality_data, user_profile } = req.body;

    // Validate input
    if (!air_quality_data) {
      return res.status(400).json({
        success: false,
        message: 'Air quality data is required',
        example: {
          air_quality_data: {
            local_station: { aqi: 64, category: "Moderate", pollutant: "O3", city: "New York", state: "NY" },
            tempo: { aqi: 75, category: "Moderate", city: "New York", state: "NY" }
          },
          user_profile: {
            age_group: "adult",
            health_conditions: ["asthma"],
            activity_level: "moderate"
          }
        }
      });
    }

    // Merge user profile from auth and request body
    let finalUserProfile = user_profile;
    if (req.user) {
      finalUserProfile = {
        ...user_profile,
        age_group: req.user.profile?.age_group || user_profile?.age_group,
        health_conditions: req.user.profile?.health_conditions || user_profile?.health_conditions,
        activity_level: req.user.profile?.activity_level || user_profile?.activity_level,
        sensitive_to_air: req.user.profile?.sensitive_to_air || user_profile?.sensitive_to_air,
        location: `${req.user.profile?.city || ''}, ${req.user.profile?.state || ''}`.trim()
      };
    }

    // Generate health advice
    const advice = await generateHealthAdvice(air_quality_data, finalUserProfile);

    // Add user context to response
    const response = {
      ...advice,
      user_context: req.user ? {
        authenticated: true,
        user_id: req.user.id,
        name: req.user.name,
        profile_used: !!finalUserProfile,
        saved_locations_count: req.user.savedLocations?.length || 0
      } : {
        authenticated: false,
        profile_used: !!user_profile,
        note: "Login for personalized advice based on your health profile"
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Health advice route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate health advice',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get AQI health categories and their meanings
 */
router.get('/categories', (req, res) => {
  const categories = [
    {
      name: "Good",
      range: "0-50",
      color: "#00E400",
      description: "Air quality is excellent. No health concerns.",
      recommendations: ["Enjoy outdoor activities", "No restrictions needed"]
    },
    {
      name: "Moderate",
      range: "51-100",
      color: "#FFFF00",
      description: "Air quality is acceptable for most people.",
      recommendations: ["Unusually sensitive people should limit outdoor activities", "Most people can be active outdoors"]
    },
    {
      name: "Unhealthy for Sensitive Groups",
      range: "101-150",
      color: "#FF7E00",
      description: "Sensitive groups may experience health effects.",
      recommendations: ["Children, elderly, and people with health conditions should limit outdoor activities", "Everyone else can be active outdoors"]
    },
    {
      name: "Unhealthy",
      range: "151-200",
      color: "#FF0000",
      description: "Everyone may begin to experience health effects.",
      recommendations: ["Everyone should limit outdoor activities", "Sensitive groups should avoid outdoor activities"]
    },
    {
      name: "Very Unhealthy",
      range: "201-300",
      color: "#8F3F97",
      description: "Health alert: everyone may experience serious health effects.",
      recommendations: ["Everyone should avoid outdoor activities", "Stay indoors with windows closed"]
    },
    {
      name: "Hazardous",
      range: "301+",
      color: "#7E0023",
      description: "Emergency conditions: everyone is at risk.",
      recommendations: ["Everyone should remain indoors", "Wear masks if you must go outside", "Seek medical attention if experiencing symptoms"]
    }
  ];

  res.json({
    success: true,
    categories,
    user_info: req.user ? {
      authenticated: true,
      name: req.user.name
    } : {
      authenticated: false
    }
  });
});

/**
 * Quick advice for specific AQI value
 */
router.get('/quick/:aqi', async (req, res) => {
  try {
    const { aqi } = req.params;
    const aqiValue = parseInt(aqi);

    if (isNaN(aqiValue) || aqiValue < 0 || aqiValue > 500) {
      return res.status(400).json({
        success: false,
        message: 'AQI must be a number between 0 and 500'
      });
    }

    // Create mock air quality data for quick advice
    const mockAqiData = {
      local_station: {
        success: true,
        aqi: aqiValue,
        category: getCategoryFromAqi(aqiValue),
        pollutant: 'PM2.5',
        city: 'Your Location',
        state: ''
      },
      tempo: {
        success: false
      }
    };

    const advice = await generateHealthAdvice(mockAqiData, req.user?.profile);

    res.json({
      ...advice,
      note: "This is quick advice based on AQI value only. For comprehensive analysis, use the full advice endpoint with complete air quality data."
    });

  } catch (error) {
    console.error('Quick advice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate quick advice'
    });
  }
});

/**
 * Helper function to get category from AQI value
 */
function getCategoryFromAqi(aqi) {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

export default router;