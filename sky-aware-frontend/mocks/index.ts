import { appColors } from '@/constants/Colors';
import type { LocationProps } from '@/types/map';

export const DUMMY_AQI_DATA = {
  current: {
    lat: 40.7128,
    lon: -74.006,
    location: 'New York, NY',
    current_aqi_epa: 87,
    current_aqi_tempo_derived: 92,
    primary_pollutant: 'O3',
    last_updated_time: new Date().toISOString(),
    category: 'Moderate',
    color: '#FFFF00',
  },
  forecast: [
    {
      date: '2025-10-04',
      aqi_max: 95,
      category: 'Moderate',
      health_advice:
        'Unusually sensitive people should consider reducing prolonged outdoor exertion.',
    },
    {
      date: '2025-10-05',
      aqi_max: 72,
      category: 'Moderate',
      health_advice: 'Air quality is acceptable for most people.',
    },
    {
      date: '2025-10-06',
      aqi_max: 58,
      category: 'Good',
      health_advice:
        'Air quality is satisfactory, and air pollution poses little or no risk.',
    },
  ],
};

// Dummy locations with varying AQI
export const LOCATIONS: LocationProps[] = [
  {
    name: 'New York, NY',
    lat: 40.7128,
    lon: -74.006,
    aqi: 87,
    category: 'Moderate',
    color: '#FFFF00',
  },
  {
    name: 'Los Angeles, CA',
    lat: 34.0522,
    lon: -118.2437,
    aqi: 145,
    category: 'Unhealthy for Sensitive Groups',
    color: '#FF7E00',
  },
  {
    name: 'Houston, TX',
    lat: 29.7604,
    lon: -95.3698,
    aqi: 67,
    category: 'Moderate',
    color: '#FFFF00',
  },
  {
    name: 'Chicago, IL',
    lat: 41.8781,
    lon: -87.6298,
    aqi: 42,
    category: 'Good',
    color: '#00E400',
  },
  {
    name: 'Phoenix, AZ',
    lat: 33.4484,
    lon: -112.074,
    aqi: 112,
    category: 'Unhealthy for Sensitive Groups',
    color: '#FF7E00',
  },
  {
    name: 'Denver, CO',
    lat: 39.7392,
    lon: -104.9903,
    aqi: 35,
    category: 'Good',
    color: '#00E400',
  },
  {
    name: 'Miami, FL',
    lat: 25.7617,
    lon: -80.1918,
    aqi: 52,
    category: 'Moderate',
    color: '#FFFF00',
  },
  {
    name: 'Seattle, WA',
    lat: 47.6062,
    lon: -122.3321,
    aqi: 28,
    category: 'Good',
    color: '#00E400',
  },
  {
    name: 'Boston, MA',
    lat: 42.3601,
    lon: -71.0589,
    aqi: 76,
    category: 'Moderate',
    color: '#FFFF00',
  },
  {
    name: 'Dallas, TX',
    lat: 32.7767,
    lon: -96.797,
    aqi: 89,
    category: 'Moderate',
    color: '#FFFF00',
  },
];

export const getAQIColor = (aqi: number) => {
  if (aqi <= 50) return '#00E400';
  if (aqi <= 100) return '#FFFF00';
  if (aqi <= 150) return '#FF7E00';
  if (aqi <= 200) return '#FF0000';
  if (aqi <= 300) return '#8F3F97';
  return '#7E0023';
};

export const getAQICategory = (aqi: number) => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

export const getHealthAdvice = (aqi: number) => {
  if (aqi <= 50)
    return 'Good: Air quality is satisfactory, and air pollution poses little or no risk.';
  if (aqi <= 100)
    return 'Moderate: Air quality is acceptable for most people. Unusually sensitive individuals should consider limiting prolonged outdoor exertion.';
  if (aqi <= 150)
    return 'Unhealthy for Sensitive Groups: Members of sensitive groups may experience health effects. The general public is less likely to be affected.';
  if (aqi <= 200)
    return 'Unhealthy: Everyone may begin to experience health effects. Members of sensitive groups may experience more serious health effects.';
  if (aqi <= 300)
    return 'Very Unhealthy: Health alert: everyone may experience more serious health effects. Avoid all outdoor physical activity.';
  return 'Hazardous: Health warnings of emergency conditions. The entire population is more likely to be affected. Stay indoors.';
};

export const ColorScale = [
  { range: '0-50', label: 'Good', color: appColors.greenColor },
  {
    range: '51-100',
    label: 'Moderate',
    color: appColors.yellowColor,
  },
  { range: '101-150', label: 'USG', color: appColors.orangeColor },
  {
    range: '151-200',
    label: 'Unhealthy',
    color: appColors.redColor,
  },
  {
    range: '201-300',
    label: 'Very Unhealthy',
    color: appColors.purpleColor,
  },
  {
    range: '301+',
    label: 'Hazardous',
    color: appColors.beigeColor,
  },
];
