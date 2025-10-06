import axios from 'axios';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://api.sky-aware.org/api';

export interface HealthAdviceRequest {
  air_quality_data: {
    local_station: {
      success: boolean;
      aqi: number;
      category: string;
      pollutant: string;
      city: string;
      state: string;
    };
    tempo: {
      success: boolean;
      aqi: number;
      category: string;
      city: string;
      state: string;
    };
  };
  user_profile?: {
    age_group?: string;
    health_conditions?: string[];
    activity_level?: string;
  };
}

export interface HealthAdviceResponse {
  success: boolean;
  location: {
    city: string;
    state: string;
    country: string;
  };
  air_quality_summary: {
    primary_aqi: number;
    category: string;
    color: string;
    pollutant: string;
    sources_analyzed: string;
  };
  health_advice: {
    overall_assessment: string;
    immediate_actions: string;
    outdoor_activities: string;
    protection_measures: string;
    indoor_recommendations: string;
    sensitive_groups: string;
    recovery_advice: string;
    medical_guidance: string;
    ai_generated: boolean;
    confidence_level?: string;
    raw_response?: boolean;
    note?: string;
  };
  user_profile: {
    personalized: boolean;
    age_group?: string;
    health_conditions?: string[];
    activity_level?: string;
  };
  timestamp: string;
  user_context: {
    authenticated: boolean;
    profile_used: boolean;
    note: string;
  };
}

export const getHealthAdvice = async (
  data: HealthAdviceRequest,
): Promise<HealthAdviceResponse> => {
  try {
    const res = await axios.post(`${BASE_URL}/health/advice`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return res.data;
  } catch (error: any) {
    console.error('Error fetching health advice:', error);
    throw new Error(`Failed to fetch health advice: ${error.message}`);
  }
};
