import { Router } from "express";
import { getAirNowData } from "../services/airnowService.js";
import { getTempoData, getTempoDataArea } from "../services/tempoService.js";
// import { optionalAuth } from "../middleware/authMiddleware.js";

const router = Router();

// Apply optional authentication to all routes
// router.use(optionalAuth);

// Default coordinates for when user just loads the page (New York City)
const DEFAULT_COORDINATES = {
  lat: 40.7128,
  lon: -74.0060
};

// City coordinates lookup for major North American cities
const CITY_COORDINATES = {
  "new_york": { lat: 40.7128, lon: -74.0060, state: "NY", country: "US" },
  "los_angeles": { lat: 34.0522, lon: -118.2437, state: "CA", country: "US" },
  "chicago": { lat: 41.8781, lon: -87.6298, state: "IL", country: "US" },
  "houston": { lat: 29.7604, lon: -95.3698, state: "TX", country: "US" },
  "phoenix": { lat: 33.4484, lon: -112.0740, state: "AZ", country: "US" },
  "philadelphia": { lat: 39.9526, lon: -75.1652, state: "PA", country: "US" },
  "san_antonio": { lat: 29.4241, lon: -98.4936, state: "TX", country: "US" },
  "san_diego": { lat: 32.7157, lon: -117.1611, state: "CA", country: "US" },
  "dallas": { lat: 32.7767, lon: -96.7970, state: "TX", country: "US" },
  "san_jose": { lat: 37.3382, lon: -121.8863, state: "CA", country: "US" },
  "austin": { lat: 30.2672, lon: -97.7431, state: "TX", country: "US" },
  "jacksonville": { lat: 30.3322, lon: -81.6557, state: "FL", country: "US" },
  "fort_worth": { lat: 32.7555, lon: -97.3308, state: "TX", country: "US" },
  "columbus": { lat: 39.9612, lon: -82.9988, state: "OH", country: "US" },
  "charlotte": { lat: 35.2271, lon: -80.8431, state: "NC", country: "US" },
  "san_francisco": { lat: 37.7749, lon: -122.4194, state: "CA", country: "US" },
  "indianapolis": { lat: 39.7684, lon: -86.1581, state: "IN", country: "US" },
  "seattle": { lat: 47.6062, lon: -122.3321, state: "WA", country: "US" },
  "denver": { lat: 39.7392, lon: -104.9903, state: "CO", country: "US" },
  "washington": { lat: 38.9072, lon: -77.0369, state: "DC", country: "US" },
  "boston": { lat: 42.3601, lon: -71.0589, state: "MA", country: "US" },
  "detroit": { lat: 42.3314, lon: -83.0458, state: "MI", country: "US" },
  "nashville": { lat: 36.1627, lon: -86.7816, state: "TN", country: "US" },
  "memphis": { lat: 35.1495, lon: -90.0490, state: "TN", country: "US" },
  "portland": { lat: 45.5152, lon: -122.6784, state: "OR", country: "US" },
  "oklahoma_city": { lat: 35.4676, lon: -97.5164, state: "OK", country: "US" },
  "las_vegas": { lat: 36.1699, lon: -115.1398, state: "NV", country: "US" },
  "louisville": { lat: 38.2527, lon: -85.7585, state: "KY", country: "US" },
  "baltimore": { lat: 39.2904, lon: -76.6122, state: "MD", country: "US" },
  "milwaukee": { lat: 43.0389, lon: -87.9065, state: "WI", country: "US" },
  "albuquerque": { lat: 35.0844, lon: -106.6504, state: "NM", country: "US" },
  "tucson": { lat: 32.2226, lon: -110.9747, state: "AZ", country: "US" },
  "fresno": { lat: 36.7378, lon: -119.7871, state: "CA", country: "US" },
  "sacramento": { lat: 38.5816, lon: -121.4944, state: "CA", country: "US" },
  "atlanta": { lat: 33.7490, lon: -84.3880, state: "GA", country: "US" },
  "kansas_city": { lat: 39.0997, lon: -94.5786, state: "MO", country: "US" },
  "colorado_springs": { lat: 38.8339, lon: -104.8214, state: "CO", country: "US" },
  "omaha": { lat: 41.2565, lon: -95.9345, state: "NE", country: "US" },
  "raleigh": { lat: 35.7796, lon: -78.6382, state: "NC", country: "US" },
  "miami": { lat: 25.7617, lon: -80.1918, state: "FL", country: "US" },
  "virginia_beach": { lat: 36.8529, lon: -76.0224, state: "VA", country: "US" },
  "oakland": { lat: 37.8044, lon: -122.2712, state: "CA", country: "US" },
  "minneapolis": { lat: 44.9778, lon: -93.2650, state: "MN", country: "US" },
  "tulsa": { lat: 36.1540, lon: -95.9928, state: "OK", country: "US" },
  "tampa": { lat: 27.9506, lon: -82.4572, state: "FL", country: "US" },
  "new_orleans": { lat: 29.9511, lon: -90.0715, state: "LA", country: "US" },
  "wichita": { lat: 37.6872, lon: -97.3301, state: "KS", country: "US" },
  "cleveland": { lat: 41.4993, lon: -81.6944, state: "OH", country: "US" },
  "honolulu": { lat: 21.3099, lon: -157.8581, state: "HI", country: "US" },
  "toronto": { lat: 43.6532, lon: -79.3832, state: "ON", country: "CA" },
  "vancouver": { lat: 49.2827, lon: -123.1207, state: "BC", country: "CA" },
  "montreal": { lat: 45.5017, lon: -73.5673, state: "QC", country: "CA" },
  "calgary": { lat: 51.0447, lon: -114.0719, state: "AB", country: "CA" },
  "ottawa": { lat: 45.4215, lon: -75.6972, state: "ON", country: "CA" },
  "edmonton": { lat: 53.5461, lon: -113.4938, state: "AB", country: "CA" },
  "winnipeg": { lat: 49.8951, lon: -97.1384, state: "MB", country: "CA" }
};

// Helper function to normalize city name for lookup
function normalizeCityName(cityName) {
  return cityName.toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

// Helper function to filter AQI data based on criteria
function filterAqiData(data, filters) {
  if (!data || !Array.isArray(data)) return data;

  return data.filter(point => {
    // AQI range filter
    if (filters.min_aqi && point.aqi < filters.min_aqi) return false;
    if (filters.max_aqi && point.aqi > filters.max_aqi) return false;

    // Category filter
    if (filters.category && point.category !== filters.category) return false;

    // Pollutant filter (for AirNow data)
    if (filters.pollutant && point.pollutant && 
        point.pollutant.toLowerCase() !== filters.pollutant.toLowerCase()) return false;

    return true;
  });
}

// Helper function to get AQI category levels
function getAqiCategoryInfo() {
  return [
    { name: "Good", range: "0-50", color: "#00E400" },
    { name: "Moderate", range: "51-100", color: "#FFFF00" },
    { name: "Unhealthy for Sensitive Groups", range: "101-150", color: "#FF7E00" },
    { name: "Unhealthy", range: "151-200", color: "#FF0000" },
    { name: "Very Unhealthy", range: "201-300", color: "#8F3F97" },
    { name: "Hazardous", range: "301+", color: "#7E0023" }
  ];
}

router.get("/", async (req, res, next) => {
  let { 
    lat, lon, radius, defaults, city, state, country,
    min_aqi, max_aqi, category, pollutant, sort_by, order, limit,
    save_location
  } = req.query;

  // Handle save_location parameter - requires authentication
  if (save_location === 'true' && !req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required to save locations",
      hint: "Please login first to save locations"
    });
  }

  // Handle city search
  if (city && !lat && !lon) {
    const normalizedCity = normalizeCityName(city);
    const cityData = CITY_COORDINATES[normalizedCity];
    
    if (cityData) {
      lat = cityData.lat;
      lon = cityData.lon;
      // Override state/country if found in our database
      if (!state) state = cityData.state;
      if (!country) country = cityData.country;
    } else {
      return res.status(400).json({
        success: false,
        message: `City "${city}" not found in our database.`,
        available_cities: Object.keys(CITY_COORDINATES).map(key => 
          key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        ).slice(0, 10) // Show first 10 as examples
      });
    }
  }

  // Handle defaults flag - use default coordinates if no location provided
  if (defaults === 'true' || (!lat && !lon && !city)) {
    lat = DEFAULT_COORDINATES.lat;
    lon = DEFAULT_COORDINATES.lon;
    defaults = 'true';
  }

  if (!lat || !lon) {
    return res.status(400).json({
      success: false,
      message: "Latitude and longitude are required, or provide a city name.",
      hint: "Use ?city=new_york or ?lat=40.7128&lon=-74.0060"
    });
  }

  // Parse numeric filters
  const filters = {
    min_aqi: min_aqi ? Number(min_aqi) : null,
    max_aqi: max_aqi ? Number(max_aqi) : null,
    category: category || null,
    pollutant: pollutant || null
  };

  // Determine search parameters
  const searchRadius = radius ? Number(radius) : (defaults === 'true' ? 50 : 25);
  const useAreaSearch = radius || defaults === 'true';
  const resultLimit = limit ? Math.min(Number(limit), 100) : 50; // Max 100 results

  try {
    // Fetch data from both sources concurrently
    const [airNowResult, tempoResult] = await Promise.all([
      getAirNowData(Number(lat), Number(lon)),
      useAreaSearch 
        ? getTempoDataArea(Number(lat), Number(lon), searchRadius)
        : getTempoData(Number(lat), Number(lon))
    ]);

    // Apply filters to tempo data if it's an area search
    let filteredTempoData = tempoResult;
    if (useAreaSearch && tempoResult.success && tempoResult.data_points) {
      const filtered = filterAqiData(tempoResult.data_points, filters);
      
      // Sort results if requested
      if (sort_by === 'aqi') {
        filtered.sort((a, b) => {
          const sortOrder = order === 'desc' ? -1 : 1;
          return (a.aqi - b.aqi) * sortOrder;
        });
      } else if (sort_by === 'distance') {
        filtered.sort((a, b) => {
          const sortOrder = order === 'desc' ? -1 : 1;
          return (Number(a.distance_km) - Number(b.distance_km)) * sortOrder;
        });
      }

      // Limit results
      const limitedData = filtered.slice(0, resultLimit);
      
      filteredTempoData = {
        ...tempoResult,
        data_points: limitedData,
        area_summary: {
          ...tempoResult.area_summary,
          total_points: filtered.length,
          displayed_points: limitedData.length,
          filtered: filtered.length !== tempoResult.data_points.length
        }
      };
    }

    // Structure the response with both data sources
    const response = {
      search_parameters: {
        center: { latitude: Number(lat), longitude: Number(lon) },
        radius_km: useAreaSearch ? searchRadius : null,
        search_type: useAreaSearch ? 'area' : 'point',
        is_nearby_search: defaults === 'true',
        location_source: defaults === 'true' ? 
          (req.query.lat && req.query.lon ? 'user_location' : 'default_nyc') : 
          (city ? 'city_lookup' : 'user_specified'),
        applied_filters: {
          city: city || null,
          state: state || null,
          country: country || null,
          min_aqi: filters.min_aqi,
          max_aqi: filters.max_aqi,
          category: filters.category,
          pollutant: filters.pollutant,
          sort_by: sort_by || null,
          order: order || 'asc',
          limit: resultLimit
        }
      },
      
      local_station: airNowResult.success ? {
        success: true,
        city: airNowResult.city,
        state: airNowResult.state,
        aqi: airNowResult.aqi,
        category: airNowResult.category,
        pollutant: airNowResult.pollutant,
        timestamp: airNowResult.timestamp,
        source: "AirNow API",
        meets_filter: (!filters.min_aqi || airNowResult.aqi >= filters.min_aqi) &&
                     (!filters.max_aqi || airNowResult.aqi <= filters.max_aqi) &&
                     (!filters.category || airNowResult.category === filters.category) &&
                     (!filters.pollutant || airNowResult.pollutant?.toLowerCase() === filters.pollutant?.toLowerCase())
      } : {
        success: false,
        message: airNowResult.message,
        error: airNowResult.error,
        city: city || "Unknown",
        source: "AirNow API"
      },
      
      tempo: filteredTempoData.success ? {
        success: true,
        city: city || (airNowResult.success ? airNowResult.city : "Unknown"),
        state: state || (airNowResult.success ? airNowResult.state : null),
        country: country || "US",
        ...(useAreaSearch ? {
          // Area search response
          area_summary: filteredTempoData.area_summary,
          data_points: filteredTempoData.data_points,
        } : {
          // Point search response
          coordinates: filteredTempoData.coordinates,
          aqi: filteredTempoData.aqi,
          category: filteredTempoData.category,
          color: filteredTempoData.color,
          distance_km: filteredTempoData.distance_km,
          meets_filter: (!filters.min_aqi || filteredTempoData.aqi >= filters.min_aqi) &&
                       (!filters.max_aqi || filteredTempoData.aqi <= filters.max_aqi) &&
                       (!filters.category || filteredTempoData.category === filters.category)
        }),
        timestamp: filteredTempoData.timestamp,
        source: filteredTempoData.source
      } : {
        success: false,
        message: filteredTempoData.message,
        error: filteredTempoData.error,
        city: city || (airNowResult.success ? airNowResult.city : "Unknown"),
        source: "NASA TEMPO NO2 Satellite Data"
      },

      filter_info: {
        available_categories: getAqiCategoryInfo(),
        available_cities_sample: Object.keys(CITY_COORDINATES).slice(0, 20).map(key => ({
          key: key,
          name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          coordinates: CITY_COORDINATES[key]
        }))
      },

      // Add user info if authenticated
      user_info: req.user ? {
        authenticated: true,
        user_id: req.user.id,
        name: req.user.name,
        saved_locations_count: req.user.savedLocations?.length || 0,
        can_save_location: true
      } : {
        authenticated: false,
        can_save_location: false,
        login_hint: "Login to save locations and access your profile"
      }
    };

    // Auto-save location if user is authenticated and save_location=true
    if (req.user && save_location === 'true') {
      try {
        const { saveUserLocation } = await import('../services/authService.js');
        
        const locationName = city || `${Number(lat).toFixed(4)}, ${Number(lon).toFixed(4)}`;
        const locationToSave = {
          name: locationName,
          lat: Number(lat),
          lon: Number(lon),
          city: city || null,
          state: state || null,
          country: country || 'US'
        };

        const saveResult = await saveUserLocation(req.user.id, locationToSave);
        
        if (saveResult.success) {
          response.location_saved = {
            success: true,
            message: `Location "${locationName}" saved successfully`,
            total_saved_locations: saveResult.savedLocations.length
          };
        } else {
          response.location_saved = {
            success: false,
            message: saveResult.message || 'Failed to save location'
          };
        }
      } catch (error) {
        console.error('Auto-save location error:', error);
        response.location_saved = {
          success: false,
          message: 'Failed to save location due to server error'
        };
      }
    } else if (save_location === 'true' && !req.user) {
      response.location_saved = {
        success: false,
        message: 'Authentication required to save locations'
      };
    }

    res.json(response);
  } catch (e) {
    console.error("AQI Route Error:", e);
    next(e);
  }
});

// GET endpoint to list available cities
router.get("/cities", (req, res) => {
  const cities = Object.keys(CITY_COORDINATES).map(key => ({
    key: key,
    name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    state: CITY_COORDINATES[key].state,
    country: CITY_COORDINATES[key].country,
    coordinates: {
      lat: CITY_COORDINATES[key].lat,
      lon: CITY_COORDINATES[key].lon
    }
  }));

  res.json({
    success: true,
    total_cities: cities.length,
    cities: cities,
    // Add user info if authenticated
    user_info: req.user ? {
      authenticated: true,
      name: req.user.name,
      saved_locations_count: req.user.savedLocations?.length || 0
    } : {
      authenticated: false
    }
  });
});

// GET endpoint to get AQI category information
router.get("/categories", (req, res) => {
  res.json({
    success: true,
    categories: getAqiCategoryInfo(),
    // Add user info if authenticated
    user_info: req.user ? {
      authenticated: true,
      name: req.user.name
    } : {
      authenticated: false
    }
  });
});

export default router;