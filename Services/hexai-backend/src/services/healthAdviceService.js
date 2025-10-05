import { getRecommendation } from './gemini/ai.js';

/**
 * Health advice categories based on AQI levels
 */
const HEALTH_CATEGORIES = {
  GOOD: { range: [0, 50], level: 'Good', color: '#00E400' },
  MODERATE: { range: [51, 100], level: 'Moderate', color: '#FFFF00' },
  UNHEALTHY_SENSITIVE: { range: [101, 150], level: 'Unhealthy for Sensitive Groups', color: '#FF7E00' },
  UNHEALTHY: { range: [151, 200], level: 'Unhealthy', color: '#FF0000' },
  VERY_UNHEALTHY: { range: [201, 300], level: 'Very Unhealthy', color: '#8F3F97' },
  HAZARDOUS: { range: [301, 500], level: 'Hazardous', color: '#7E0023' }
};

/**
 * Generate AI-powered health advice based on air quality data
 * @param {Object} aqiData - Air quality data from the client
 * @param {Object} userProfile - Optional user profile for personalized advice
 * @returns {Object} Health advice response
 */
export async function generateHealthAdvice(aqiData, userProfile = null) {
  try {
    // Validate input data
    if (!aqiData) {
      return {
        success: false,
        message: 'Air quality data is required'
      };
    }

    // Extract AQI information from both sources
    const localStation = aqiData.local_station;
    const tempoData = aqiData.tempo;
    
    // Determine the primary AQI to use for advice
    const primaryAqi = getPrimaryAqi(localStation, tempoData);
    
    if (!primaryAqi) {
      return {
        success: false,
        message: 'No valid air quality data available for analysis'
      };
    }

    // Create the AI prompt
    const prompt = createHealthAdvicePrompt(primaryAqi, aqiData, userProfile);
    
    // Get AI recommendation
    const aiResponse = await getRecommendation(prompt);
    
    // Parse and structure the response
    const structuredAdvice = parseAiResponse(aiResponse, primaryAqi);
    
    return {
      success: true,
      location: {
        city: primaryAqi.city,
        state: primaryAqi.state,
        country: aqiData.tempo?.country || 'US'
      },
      air_quality_summary: {
        primary_aqi: primaryAqi.aqi,
        category: primaryAqi.category,
        color: getHealthCategory(primaryAqi.aqi).color,
        pollutant: primaryAqi.pollutant,
        sources_analyzed: getSourcesSummary(localStation, tempoData)
      },
      health_advice: structuredAdvice,
      user_profile: userProfile ? {
        personalized: true,
        age_group: userProfile.age_group,
        health_conditions: userProfile.health_conditions,
        activity_level: userProfile.activity_level
      } : {
        personalized: false,
        note: "Login for personalized health advice based on your profile"
      },
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Health advice generation error:', error);
    
    // Fallback to basic advice if AI fails
    const fallbackAdvice = generateFallbackAdvice(aqiData);
    
    return {
      success: true,
      location: {
        city: aqiData.local_station?.city || aqiData.tempo?.city || 'Unknown',
        state: aqiData.local_station?.state || aqiData.tempo?.state || null,
        country: aqiData.tempo?.country || 'US'
      },
      air_quality_summary: {
        primary_aqi: fallbackAdvice.aqi,
        category: fallbackAdvice.category,
        color: getHealthCategory(fallbackAdvice.aqi).color,
        sources_analyzed: getSourcesSummary(aqiData.local_station, aqiData.tempo)
      },
      health_advice: fallbackAdvice.advice,
      ai_generated: false,
      fallback_reason: 'AI service temporarily unavailable',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Parse AI response into structured format
 */
function parseAiResponse(aiResponse, primaryAqi) {
  try {
    console.log('🔍 Parsing AI response:', aiResponse.substring(0, 200) + '...');
    
    // Clean the response first - remove code blocks and markdown
    let cleanedResponse = aiResponse
      .replace(/```json\s*/g, '')  // Remove ```json
      .replace(/```\s*/g, '')      // Remove ```
      .replace(/^\s*["']|["']\s*$/g, '') // Remove leading/trailing quotes
      .trim();
    
    // Try to find and extract the JSON object
    const jsonStart = cleanedResponse.indexOf('{');
    const jsonEnd = cleanedResponse.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      const jsonString = cleanedResponse.substring(jsonStart, jsonEnd + 1);
      
      try {
        const parsed = JSON.parse(jsonString);
        
        // Clean up each field to remove any remaining artifacts
        const cleanedParsed = {};
        for (const [key, value] of Object.entries(parsed)) {
          if (typeof value === 'string') {
            // Clean up the string values
            cleanedParsed[key] = value
              .replace(/^["']|["']$/g, '')  // Remove quotes
              .replace(/\\n/g, '\n')        // Convert \n to actual newlines
              .replace(/\\\"/g, '"')        // Convert \" to "
              .replace(/```json.*?```/gs, '') // Remove any remaining code blocks
              .replace(/^\s*\",?\s*/, '')   // Remove leading ", 
              .replace(/\",?\s*$/, '')      // Remove trailing ",
              .trim();
          } else {
            cleanedParsed[key] = value;
          }
        }
        
        console.log('✅ Successfully parsed and cleaned JSON response');
        return {
          ...cleanedParsed,
          ai_generated: true,
          confidence_level: getConfidenceLevel(primaryAqi.aqi)
        };
      } catch (parseError) {
        console.warn('⚠️ JSON parsing failed, attempting manual extraction:', parseError.message);
      }
    }
  } catch (error) {
    console.error('❌ Error in initial JSON parsing:', error);
  }
  
  // If JSON parsing fails, try to extract structured data manually
  console.log('🔧 Attempting manual extraction from AI response');
  return extractStructuredData(aiResponse, primaryAqi);
}

/**
 * Extract structured data from unstructured AI response
 */
function extractStructuredData(aiResponse, primaryAqi) {
  // Clean the response
  const cleanText = aiResponse
    .replace(/```json.*?```/gs, '')  // Remove code blocks
    .replace(/\*\*/g, '')            // Remove markdown bold
    .replace(/\\n/g, ' ')            // Replace \n with spaces
    .replace(/\\\"/g, '"')           // Replace \" with "
    .replace(/^\s*["']|["']\s*$/g, '') // Remove quotes
    .trim();
  
  // Try to extract sections using different patterns
  const extractedAdvice = {
    overall_assessment: extractField(cleanText, ['overall_assessment', 'assessment', 'summary']),
    immediate_actions: extractField(cleanText, ['immediate_actions', 'immediate', 'urgent', 'right now']),
    outdoor_activities: extractField(cleanText, ['outdoor_activities', 'outdoor', 'exercise', 'activities']),
    protection_measures: extractField(cleanText, ['protection_measures', 'protection', 'mask', 'equipment']),
    indoor_recommendations: extractField(cleanText, ['indoor_recommendations', 'indoor', 'inside', 'home']),
    sensitive_groups: extractField(cleanText, ['sensitive_groups', 'sensitive', 'children', 'elderly', 'vulnerable']),
    recovery_advice: extractField(cleanText, ['recovery_advice', 'recovery', 'foods', 'nutrition', 'diet']),
    medical_guidance: extractField(cleanText, ['medical_guidance', 'medical', 'doctor', 'seek help', 'emergency']),
    duration_outlook: extractField(cleanText, ['duration_outlook', 'duration', 'how long', 'expect']),
    lifestyle_adjustments: extractField(cleanText, ['lifestyle_adjustments', 'lifestyle', 'changes', 'adjustments'])
  };
  
  // Remove empty fields and provide fallbacks
  Object.keys(extractedAdvice).forEach(key => {
    if (!extractedAdvice[key] || extractedAdvice[key].length < 10) {
      extractedAdvice[key] = getFallbackAdvice(key, primaryAqi.aqi);
    }
  });
  
  return {
    ...extractedAdvice,
    ai_generated: true,
    extraction_method: 'manual',
    confidence_level: getConfidenceLevel(primaryAqi.aqi),
    note: "Response was extracted and cleaned from AI output"
  };
}

/**
 * Extract specific field from text using keywords
 */
function extractField(text, keywords) {
  for (const keyword of keywords) {
    // Look for the keyword followed by content
    const patterns = [
      new RegExp(`"${keyword}"\\s*:\\s*"([^"]+)"`, 'i'),
      new RegExp(`${keyword}[:\\-]\\s*([^.]{20,200}[.!?])`, 'i'),
      new RegExp(`${keyword.replace(/_/g, '\\s+')}[:\\-]\\s*([^.]{20,200}[.!?])`, 'i')
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim()
          .replace(/^["']|["']$/g, '')  // Remove quotes
          .replace(/\s+/g, ' ')         // Normalize whitespace
          .trim();
      }
    }
  }
  
  // If no specific pattern found, try to find sentences containing the keywords
  const sentences = text.split(/[.!?]+/);
  for (const keyword of keywords) {
    const relevantSentences = sentences.filter(sentence => 
      sentence.toLowerCase().includes(keyword.toLowerCase()) && 
      sentence.length > 20
    );
    
    if (relevantSentences.length > 0) {
      return relevantSentences[0].trim()
        .replace(/^["']|["']$/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }
  }
  
  return '';
}

/**
 * Get fallback advice for specific fields
 */
function getFallbackAdvice(field, aqi) {
  const fallbacks = {
    overall_assessment: `Air quality index is ${aqi}. ${aqi <= 50 ? 'Conditions are good.' : aqi <= 100 ? 'Conditions are moderate.' : aqi <= 150 ? 'Sensitive groups should be cautious.' : 'Air quality is unhealthy.'}`,
    immediate_actions: aqi <= 50 ? 'No immediate actions needed.' : aqi <= 100 ? 'Sensitive individuals should monitor symptoms.' : 'Limit outdoor exposure, especially for sensitive groups.',
    outdoor_activities: aqi <= 50 ? 'All outdoor activities are safe.' : aqi <= 100 ? 'Most outdoor activities are safe.' : 'Limit prolonged outdoor activities.',
    protection_measures: aqi <= 50 ? 'No protection needed.' : aqi <= 100 ? 'Sensitive individuals may want masks.' : 'Consider wearing masks outdoors.',
    indoor_recommendations: aqi <= 100 ? 'Normal indoor ventilation is fine.' : 'Keep windows closed and use air purifiers if available.',
    sensitive_groups: aqi <= 50 ? 'No special precautions needed.' : 'Children, elderly, and those with respiratory conditions should be cautious.',
    recovery_advice: 'Stay hydrated and eat antioxidant-rich foods like fruits and vegetables.',
    medical_guidance: aqi <= 100 ? 'Monitor symptoms and consult doctor if concerned.' : 'Seek medical attention if experiencing breathing difficulties.',
    duration_outlook: 'Check local forecasts for air quality improvements.',
    lifestyle_adjustments: aqi <= 100 ? 'No major adjustments needed.' : 'Consider staying indoors during peak pollution hours.'
  };
  
  return fallbacks[field] || 'Please consult local health authorities for guidance.';
}

/**
 * Create a comprehensive prompt for Gemini AI
 */
function createHealthAdvicePrompt(primaryAqi, aqiData, userProfile) {
  const localStation = aqiData.local_station;
  const tempoData = aqiData.tempo;
  
  let prompt = `You are a health expert specializing in air quality and public health. Analyze the following air quality data and provide comprehensive, practical health advice.

CURRENT AIR QUALITY DATA:
- Location: ${primaryAqi.city}, ${primaryAqi.state}
- Primary AQI: ${primaryAqi.aqi} (${primaryAqi.category})
- Main Pollutant: ${primaryAqi.pollutant}
- Data Sources: ${getSourcesSummary(localStation, tempoData)}

LOCAL STATION DATA:
${localStation?.success ? `- AQI: ${localStation.aqi} (${localStation.category})
- Pollutant: ${localStation.pollutant}
- Location: ${localStation.city}, ${localStation.state}` : '- No local station data available'}

SATELLITE DATA (TEMPO):
${tempoData?.success ? `- Average AQI in area: ${tempoData.area_summary?.avg_aqi || tempoData.aqi}
- Range: ${tempoData.area_summary?.min_aqi || tempoData.aqi} - ${tempoData.area_summary?.max_aqi || tempoData.aqi}
- Data points analyzed: ${tempoData.area_summary?.total_points || 1}` : '- No satellite data available'}

${userProfile ? `USER PROFILE:
- Age Group: ${userProfile.age_group || 'Not specified'}
- Health Conditions: ${userProfile.health_conditions?.join(', ') || 'None specified'}
- Activity Level: ${userProfile.activity_level || 'Not specified'}
- Sensitive to Air Quality: ${userProfile.sensitive_to_air ? 'Yes' : 'No'}
- Location: ${userProfile.location || 'Not specified'}` : 'USER PROFILE: No user profile provided (general advice)'}

IMPORTANT: Respond ONLY with a valid JSON object. Do not include any markdown, code blocks, or extra text. Start directly with { and end with }.

Provide health advice in this EXACT JSON format:
{
  "overall_assessment": "Brief assessment of current air quality conditions in plain text",
  "immediate_actions": "What to do right now based on current conditions in plain text",
  "outdoor_activities": "Specific advice for outdoor activities and exercise in plain text",
  "protection_measures": "Protective equipment and measures to take in plain text",
  "indoor_recommendations": "How to manage indoor air quality in plain text",
  "sensitive_groups": "Special advice for children, elderly, and those with health conditions in plain text",
  "recovery_advice": "Foods, activities, or treatments if already exposed to poor air in plain text",
  "medical_guidance": "When to seek medical attention in plain text",
  "duration_outlook": "How long these conditions might persist and what to expect in plain text",
  "lifestyle_adjustments": "Temporary lifestyle changes recommended in plain text"
}

Requirements:
- Use plain text only (no markdown, no ** bold **, no bullet points)
- Each field should be 1-3 sentences maximum
- Be specific to AQI level ${primaryAqi.aqi} and pollutant ${primaryAqi.pollutant}
- Make advice practical and actionable
- Include specific food recommendations for recovery if air quality is poor
- Be clear about urgency levels

RESPOND ONLY WITH THE JSON OBJECT - NO OTHER TEXT.`;

  return prompt;
}

/**
 * Extract relevant sections from unstructured AI response
 */
function extractSection(text, keywords) {
  const sentences = text.split(/[.!?]+/);
  const relevantSentences = sentences.filter(sentence => 
    keywords.some(keyword => 
      sentence.toLowerCase().includes(keyword.toLowerCase())
    )
  );
  
  return relevantSentences.slice(0, 2).join('. ').trim() || 
         "See overall assessment for guidance on this topic.";
}

/**
 * Get primary AQI data for analysis
 */
function getPrimaryAqi(localStation, tempoData) {
  // Prefer local station data if available and recent
  if (localStation?.success && localStation.aqi) {
    return {
      aqi: localStation.aqi,
      category: localStation.category,
      pollutant: localStation.pollutant,
      city: localStation.city,
      state: localStation.state,
      source: 'local_station'
    };
  }
  
  // Fall back to tempo data
  if (tempoData?.success) {
    if (tempoData.area_summary) {
      return {
        aqi: tempoData.area_summary.avg_aqi,
        category: tempoData.area_summary.category,
        pollutant: 'NO2', // TEMPO measures NO2
        city: tempoData.city,
        state: tempoData.state,
        source: 'tempo_satellite'
      };
    } else if (tempoData.aqi) {
      return {
        aqi: tempoData.aqi,
        category: tempoData.category,
        pollutant: 'NO2',
        city: tempoData.city,
        state: tempoData.state,
        source: 'tempo_satellite'
      };
    }
  }
  
  return null;
}

/**
 * Get sources summary for the response
 */
function getSourcesSummary(localStation, tempoData) {
  const sources = [];
  if (localStation?.success) sources.push('AirNow Local Station');
  if (tempoData?.success) sources.push('NASA TEMPO Satellite');
  return sources.join(', ') || 'No data sources available';
}

/**
 * Get health category based on AQI value
 */
function getHealthCategory(aqi) {
  for (const category of Object.values(HEALTH_CATEGORIES)) {
    if (aqi >= category.range[0] && aqi <= category.range[1]) {
      return category;
    }
  }
  return HEALTH_CATEGORIES.HAZARDOUS;
}

/**
 * Get confidence level based on AQI accuracy
 */
function getConfidenceLevel(aqi) {
  if (aqi <= 50) return 'high';
  if (aqi <= 150) return 'medium';
  return 'high'; // Critical conditions need high confidence advice
}

/**
 * Generate fallback advice when AI is unavailable
 */
function generateFallbackAdvice(aqiData) {
  const localStation = aqiData.local_station;
  const tempoData = aqiData.tempo;
  const primaryAqi = getPrimaryAqi(localStation, tempoData);
  
  if (!primaryAqi) {
    return {
      aqi: 0,
      category: 'Unknown',
      advice: {
        overall_assessment: "Air quality data is currently unavailable. Please check local air quality reports.",
        immediate_actions: "Monitor local weather and air quality reports for current conditions.",
        outdoor_activities: "Use caution with outdoor activities until air quality data is available.",
        protection_measures: "Consider carrying a mask as a precaution.",
        indoor_recommendations: "Ensure good ventilation indoors.",
        sensitive_groups: "Those with respiratory conditions should be extra cautious.",
        recovery_advice: "Stay hydrated and eat antioxidant-rich foods.",
        medical_guidance: "Consult healthcare providers if experiencing respiratory symptoms."
      }
    };
  }
  
  const aqi = primaryAqi.aqi;
  
  if (aqi <= 50) {
    return {
      aqi,
      category: primaryAqi.category,
      advice: {
        overall_assessment: "Air quality is excellent. No health concerns for any group.",
        immediate_actions: "Enjoy outdoor activities freely.",
        outdoor_activities: "Perfect conditions for all outdoor activities including exercise.",
        protection_measures: "No protective measures needed.",
        indoor_recommendations: "Open windows to enjoy fresh air.",
        sensitive_groups: "No special precautions needed.",
        recovery_advice: "No recovery measures needed.",
        medical_guidance: "No medical concerns related to air quality."
      }
    };
  } else if (aqi > 150) {
    return {
      aqi,
      category: primaryAqi.category,
      advice: {
        overall_assessment: "Air quality is unhealthy. Take immediate protective measures.",
        immediate_actions: "Limit outdoor exposure, especially strenuous activities.",
        outdoor_activities: "Avoid outdoor exercise. Stay indoors when possible.",
        protection_measures: "Wear N95 masks when outdoors. Use air purifiers indoors.",
        indoor_recommendations: "Keep windows closed. Use air conditioning on recirculate mode.",
        sensitive_groups: "Children, elderly, and those with health conditions should remain indoors.",
        recovery_advice: "Drink plenty of water, eat antioxidant-rich foods (berries, leafy greens), consider vitamin C.",
        medical_guidance: "Seek medical attention if experiencing breathing difficulties, chest pain, or persistent cough."
      }
    };
  } else {
    return {
      aqi,
      category: primaryAqi.category,
      advice: {
        overall_assessment: "Air quality is moderate. Some people may experience minor symptoms.",
        immediate_actions: "Sensitive individuals should limit prolonged outdoor activities.",
        outdoor_activities: "Reduce intensity of outdoor exercise. Take breaks indoors.",
        protection_measures: "Consider masks for sensitive individuals during outdoor activities.",
        indoor_recommendations: "Normal indoor activities. Limit opening windows during peak pollution hours.",
        sensitive_groups: "Those with asthma or heart conditions should be cautious.",
        recovery_advice: "Stay hydrated, eat fruits and vegetables high in antioxidants.",
        medical_guidance: "Monitor symptoms. Consult doctor if breathing becomes difficult."
      }
    };
  }
}

/**
 * Get activity-specific advice using AI
 * @param {number} aqi - AQI value
 * @param {string} activity - Activity type
 * @param {string} pollutant - Main pollutant
 * @param {Object} userProfile - Optional user profile
 * @returns {Object} Activity-specific advice
 */
export async function getActivityAdvice(aqi, activity, pollutant = 'PM2.5', userProfile = null) {
  try {
    const prompt = `You are a health expert. Current air quality:
- AQI: ${aqi}
- Main pollutant: ${pollutant}
- Activity: ${activity}

${userProfile ? `User profile: ${JSON.stringify(userProfile)}` : ''}

Provide specific advice for this activity under current air quality conditions. Include:
1. Safety level (safe/caution/unhealthy/dangerous)
2. Specific recommendations
3. Protective measures if needed
4. Alternative suggestions

Respond in JSON format:
{
  "level": "safe/caution/unhealthy/dangerous",
  "advice": "Specific advice for the activity",
  "alternatives": "Alternative activities if needed",
  "protection": "Protective measures to take"
}`;

    const result = await getRecommendation(prompt);
    
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        activity,
        aqi,
        ...parsed,
        ai_generated: true
      };
    }
    
    return {
      activity,
      aqi,
      advice: result,
      ai_generated: true
    };
    
  } catch (error) {
    console.error('Error generating activity advice:', error);
    return getFallbackActivityAdvice(aqi, activity);
  }
}

/**
 * Fallback activity advice when AI is unavailable
 */
function getFallbackActivityAdvice(aqi, activity) {
  const level = aqi <= 50 ? 'safe' : aqi <= 100 ? 'caution' : aqi <= 150 ? 'unhealthy' : 'dangerous';
  
  return {
    activity,
    aqi,
    level,
    advice: `Air quality is ${level} for ${activity}. Consider current conditions.`,
    ai_generated: false
  };
}

export default {
  generateHealthAdvice,
  getActivityAdvice,
  getHealthCategory,
  HEALTH_CATEGORIES
};