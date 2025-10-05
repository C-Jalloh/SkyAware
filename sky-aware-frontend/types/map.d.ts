import type mapboxgl from 'mapbox-gl';

export interface LocationProps {
  lat: number;
  lon: number;
  name: string;
  aqi: number;
  category: string;
  color: string;
}

export interface MapProps {
  map?: mapboxgl.Map | null;
  locations: TempoDataPoint[];
  onLocationSelect: (location: TempoDataPoint) => void;
  selectedLocation: TempoDataPoint | null;
}

// types/airQuality.ts

export interface SearchParameters {
  center: Coordinates;
  radius_km: number;
  search_type: string;
  is_nearby_search: boolean;
  location_source: string;
  applied_filters: AQIFilters;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocalStation {
  success: boolean;
  city: string;
  state: string;
  aqi: number;
  category: string;
  pollutant: string;
  timestamp: string;
  source: string;
  meets_filter: boolean;
}

export interface Tempo {
  success: boolean;
  city: string;
  state: string;
  country: string;
  area_summary: AreaSummary;
  data_points: TempoDataPoint[];
  timestamp: string;
  source: string;
}

export interface AreaSummary {
  center_coordinates: Coordinates;
  radius_km: number;
  total_points: number;
  avg_aqi: number;
  min_aqi: number;
  max_aqi: number;
  category: string;
  displayed_points: number;
  filtered: boolean;
}

export interface TempoDataPoint {
  coordinates: Coordinates;
  aqi: number;
  category: string;
  color: string;
  distance_km: string;
}

export interface FilterInfo {
  available_categories: AQICategory[];
  available_cities_sample: CitySample[];
}

export interface AQICategory {
  name: string;
  range: string;
  color: string;
}

export interface CitySample {
  key: string;
  name: string;
  coordinates: CityCoordinates;
}

export interface CityCoordinates {
  lat: number;
  lon: number;
  state: string;
  country: string;
}

export interface UserInfo {
  authenticated: boolean;
  can_save_location: boolean;
  login_hint: string;
}

export interface AirQualityResponse {
  search_parameters: SearchParameters;
  local_station: LocalStation;
  tempo: Tempo;
  filter_info: FilterInfo;
  user_info: UserInfo;
}

export interface AQIFilters {
  lat?: number;
  lon?: number;
  city?: string;
  defaults?: boolean;
  min_aqi?: number;
  max_aqi?: number;
  radius?: number;
  sort_by?: string;
  order?: 'asc' | 'desc';
  limit?: number;
}

export interface SavedPlaces {
  name: string;
  city?: string;
  lat: number;
  lon: number;
}
