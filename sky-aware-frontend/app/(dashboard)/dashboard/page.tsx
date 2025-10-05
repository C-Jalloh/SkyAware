/* eslint-disable no-nested-ternary */
/* eslint-disable no-alert */
'use client';

import { useEffect, useRef, useState } from 'react';

import { useQuery, useMutation } from '@tanstack/react-query';
import {
  AlertTriangle,
  X,
  Info,
  Wind,
  MapPin,
  CheckCircle,
  Eye,
  Layers,
  Calendar,
  Heart,
  TrendingUp,
} from 'lucide-react';
import mapboxgl from 'mapbox-gl';

import ErrorComponent from '@/components/error';
import ForecastModal from '@/components/fore-cast-modal';
import HealthAdviceModal from '@/components/health-advice-modal';
import LastUpdated from '@/components/last-updated';
import DashboardSkeleton from '@/components/loading-dashboard';
import MapboxView from '@/components/map-box';
import SearchBox from '@/components/search-box';
import { Button } from '@/components/ui/button';
import { useFetchCategories } from '@/hooks/use-category';
import { useFetchCurrentAqi } from '@/hooks/use-current-aqi';
import { useDebounce } from '@/hooks/use-debounce';
import { DUMMY_AQI_DATA, getAQIColor, getHealthAdvice } from '@/mocks';
import {
  type ForecastRequest,
  getForecast,
  type ForecastResponse,
} from '@/services/forecast';
import {
  type HealthAdviceRequest,
  type HealthAdviceResponse,
  getHealthAdvice as getHealthAdviceAPI,
} from '@/services/health-advice';
import { getMapGeocoding } from '@/services/map';

const mapBoxApiKey =
  process.env.NEXT_MAPBOX_API_KEY ??
  'pk.eyJ1IjoiYy1qYWxsb2giLCJhIjoiY21nYnd4N2M1MTJudTJtcXdxY2oxdWQzdCJ9.QBxmXdQ7LU0iaNGffCKa0Q';

const HomePage = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentData, setCurrentData] = useState(DUMMY_AQI_DATA.current);
  const [forecast] = useState(DUMMY_AQI_DATA.forecast);
  const [showApiKeyWarning, setShowApiKeyWarning] = useState(
    mapBoxApiKey ? false : true,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showHealthAdviceModal, setShowHealthAdviceModal] = useState(false);
  const [healthAdviceData, setHealthAdviceData] =
    useState<HealthAdviceResponse | null>(null);
  const [showForecastModal, setShowForecastModal] = useState(false);
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(
    null,
  );
  const debouncedQuery = useDebounce(searchQuery, 600);

  mapboxgl.accessToken = mapBoxApiKey;

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const {
    data: categories,
    isFetching: isFetchingCategories,
    error,
  } = useFetchCategories();

  // Health advice mutation
  const healthAdviceMutation = useMutation({
    mutationFn: (data: HealthAdviceRequest) => getHealthAdviceAPI(data),
    onSuccess: data => {
      setHealthAdviceData(data);
      setShowHealthAdviceModal(true);
    },
    onError: error => {
      console.error('Failed to get health advice:', error);
      alert('Failed to get health advice. Please try again.');
    },
  });

  // Forecast mutation
  const forecastMutation = useMutation({
    mutationFn: (data: ForecastRequest) => getForecast(data),
    onSuccess: data => {
      setForecastData(data);
      setShowForecastModal(true);
    },
    onError: error => {
      console.error('Failed to get forecast:', error);
      alert('Failed to get forecast. Please try again.');
    },
  });

  const handleGetHealthAdvice = () => {
    // Safely handle location parsing
    const locationParts = data?.local_station.city
      ? data?.local_station.city.split(',')
      : [];
    const city = locationParts[0]?.trim() || 'Unknown';
    const state = locationParts[1]?.trim() || 'Unknown';

    console.log('Parsed city:', city, 'Parsed state:', state);

    const aqiData: HealthAdviceRequest = {
      air_quality_data: {
        local_station: {
          success: true,
          aqi: data?.local_station.aqi ?? 0,
          category: data?.local_station.category ?? 'Unknown',
          pollutant: data?.local_station.pollutant ?? 'Unknown',
          city,
          state,
        },
        tempo: {
          success: true,
          aqi: data?.tempo.area_summary.max_aqi ?? 0,
          category: data ? data?.tempo.area_summary.category : 'Unknown',
          city,
          state,
        },
      },
    };

    console.log('AQI data being sent:', aqiData);
    healthAdviceMutation.mutate(aqiData);
  };

  const handleGetForecast = () => {
    const forecastParams: ForecastRequest = {
      lat: data?.tempo.area_summary.center_coordinates.latitude,
      lon: data?.tempo.area_summary.center_coordinates.longitude,
    };

    console.log('Forecast params being sent:', forecastParams);
    forecastMutation.mutate(forecastParams);
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-16.7333, 13.4],
      zoom: 13,
    });

    return () => {
      if (map.current) {
        map.current.remove(); // safe cleanup
        map.current = null;
      }
    };
  }, []);

  const { data: results } = useQuery({
    queryKey: ['mapbox-search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      if (!mapboxgl.accessToken) {
        throw new Error('Mapbox access token is not set');
      }
      const data = await getMapGeocoding(debouncedQuery, mapboxgl.accessToken);
      return data.features;
    },
    enabled: !!debouncedQuery, // auto-run when debouncedQuery is non-empty
    staleTime: 1000 * 60,
  });

  const {
    data,
    isFetching: isAqiFetching,
    error: aqiError,
    refetch: refetchAqi,
  } = useFetchCurrentAqi({
    lat: results ? results[0].geometry.coordinates[1] : undefined,
    lon: results ? results[0].geometry.coordinates[1] : undefined,
    city: results ? results[0].text : undefined,
    limit: 10,
  });

  if (isAqiFetching) {
    return <DashboardSkeleton />;
  }
  if (aqiError) {
    return (
      <ErrorComponent message={aqiError?.message} onRefresh={refetchAqi} />
    );
  }

  const handleLocationSelect = (location: any) => {
    setSelectedLocation(location ?? results?.[0]?.geometry?.center);

    // Ensure we have a proper location string
    const locationName =
      location?.name ?? location?.place_name ?? 'Unknown Location';

    setCurrentData({
      ...currentData,
      location: locationName,
      lat: location?.lat ?? location?.center?.[1] ?? currentData.lat,
      lon: location?.lon ?? location?.center?.[0] ?? currentData.lon,
      current_aqi_epa: location?.aqi ?? currentData.current_aqi_epa,
      current_aqi_tempo_derived: location?.aqi
        ? location.aqi + 5
        : currentData.current_aqi_tempo_derived,
      category: location?.category ?? currentData.category,
      color: location?.color ?? currentData.color,
    });
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;

        if (!map.current) return;

        // Move the map to the current location
        map.current?.flyTo({
          center: [longitude, latitude],
          zoom: 14,
        });

        // Add marker for current location
        new mapboxgl.Marker({ color: 'blue' })
          .setLngLat([longitude, latitude])
          .setPopup(
            new mapboxgl.Popup().setHTML('<b>Your Current Location</b>'),
          )
          .addTo(map.current);

        // Update current data with user's location
        setCurrentData({
          ...currentData,
          lat: latitude,
          lon: longitude,
          location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        });
      },
      error => {
        console.error('Error getting current location:', error);
        alert('Unable to get your location');
      },
    );
  };

  const showAlert = data && data?.local_station.aqi > 150;

  return (
    <>
      {showAlert && (
        <div className='bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-3 text-sm flex items-center justify-between shadow-lg'>
          <div className='flex items-center gap-3'>
            <AlertTriangle className='w-5 h-5 animate-pulse' />
            <span className='font-semibold'>
              Air Quality Alert: {data.local_station.city} is experiencing
              unhealthy air quality. Avoid strenuous outdoor activity.
            </span>
          </div>
          <Button
            size='icon-lg'
            className='hover:bg-red-700 p-1 rounded transition-colors'
          >
            <X className='w-4 h-4' />
          </Button>
        </div>
      )}

      {showApiKeyWarning && (
        <div className='bg-yellow-600 text-black px-4 py-3 text-sm flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <AlertTriangle className='w-4 h-4' suppressHydrationWarning />
            <span>
              <strong>Note:</strong> Replace the Mapbox access token with your
              own from{' '}
              <a
                href='https://account.mapbox.com/'
                target='_blank'
                rel='noopener noreferrer'
                className='underline font-semibold'
              >
                mapbox.com
              </a>
            </span>
          </div>
          <Button
            size='icon-lg'
            onClick={() => setShowApiKeyWarning(false)}
            className='hover:bg-yellow-700 p-1 rounded transition-colors'
          >
            <X className='w-4 h-4' />
          </Button>
        </div>
      )}

      <div className='max-w-7xl mx-auto px-4 py-6'>
        <SearchBox
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onClick={handleUseMyLocation}
        />

        <div className='bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-slate-700/50 shadow-2xl'>
          <div className='flex items-start justify-between mb-6'>
            <div>
              <h2 className='text-xl font-semibold text-gray-300 mb-2'>
                Current Air Quality
              </h2>
              <div className='flex items-center gap-2 text-sm text-gray-400'>
                <MapPin className='w-4 h-4 text-blue-400' />
                <span className='font-medium'>{data?.local_station.city}</span>
              </div>
            </div>
            <div className='text-xs text-gray-500 text-right flex flex-col gap-2'>
              <div className='font-medium'>
                <LastUpdated lastUpdated={data?.local_station.timestamp!} />
              </div>
              <div className='flex gap-2'>
                <Button
                  onClick={handleGetHealthAdvice}
                  disabled={healthAdviceMutation.isPending}
                  className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all transform hover:scale-105 shadow-lg'
                >
                  <Heart className='w-3 h-3' />
                  {healthAdviceMutation.isPending
                    ? 'Loading...'
                    : 'Health Advice'}
                </Button>
                <Button
                  onClick={handleGetForecast}
                  disabled={forecastMutation.isPending}
                  className='bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all transform hover:scale-105 shadow-lg'
                >
                  <Calendar className='w-3 h-3' />
                  {forecastMutation.isPending ? 'Loading...' : 'Get Forecast'}
                </Button>
              </div>
            </div>
          </div>

          <div className='grid md:grid-cols-3 gap-6'>
            <div className='flex items-center justify-center'>
              <div
                className='w-40 h-40 rounded-3xl flex flex-col items-center justify-center font-bold border-4 shadow-2xl relative overflow-hidden'
                style={{
                  backgroundColor: `${getAQIColor(data?.local_station.aqi!)}20`,
                  borderColor: getAQIColor(data?.local_station.aqi!),
                }}
              >
                <div className='absolute inset-0 bg-gradient-to-br from-transparent to-black/20' />
                <div
                  className='text-6xl mb-2 relative z-10'
                  style={{ color: getAQIColor(data?.local_station.aqi!) }}
                >
                  {data?.local_station.aqi ?? 'N/A'}
                </div>
                <div className='text-xs text-gray-300 relative z-10'>
                  EPA AQI
                </div>
              </div>
            </div>

            {/* Category & Pollutant Info */}
            <div className='flex flex-col justify-center space-y-4'>
              <div>
                <div className='text-sm text-gray-400 mb-1 font-medium'>
                  Air Quality
                </div>
                <div
                  className='text-3xl font-bold'
                  style={{ color: getAQIColor(data?.local_station.aqi!) }}
                >
                  {data?.local_station.category ?? 'Unknown'}
                </div>
              </div>
              <div>
                <div className='text-sm text-gray-400 mb-1 font-medium'>
                  Primary Pollutant
                </div>
                <div className='flex items-center gap-2'>
                  <Wind className='w-6 h-6 text-blue-400' />
                  <span className='text-xl font-semibold'>
                    {data?.local_station.pollutant}
                  </span>
                </div>
              </div>
            </div>

            <div className='flex flex-col justify-center'>
              <div className='bg-gradient-to-br from-blue-900/40 to-slate-800/40 border border-blue-700/50 rounded-xl p-4 shadow-lg'>
                <div className='flex items-start gap-3'>
                  <AlertTriangle className='w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5' />
                  <div>
                    <div className='font-semibold mb-2 text-blue-300'>
                      Health Advice
                    </div>
                    <div className='text-sm text-gray-300 leading-relaxed'>
                      {getHealthAdvice(data?.local_station.aqi!)}
                    </div>
                    <Button
                      onClick={handleGetHealthAdvice}
                      disabled={healthAdviceMutation.isPending}
                      variant='outline'
                      size='sm'
                      className='mt-3 text-xs border-blue-500/30 text-blue-300 hover:bg-blue-900/20'
                    >
                      <Heart className='w-3 h-3 mr-1' />
                      Get Detailed Advice
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='mt-6 pt-6 border-t border-slate-700'>
            <div className='bg-slate-900/50 rounded-xl p-4 border border-slate-600/50'>
              <div className='flex items-center gap-2 mb-3'>
                <CheckCircle className='w-5 h-5 text-green-400' />
                <h3 className='font-semibold text-gray-300'>Data Validation</h3>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='bg-slate-800/50 rounded-lg p-3 border border-blue-500/30'>
                  <div className='text-xs text-gray-400 mb-1'>
                    Ground Station (EPA)
                  </div>
                  <div className='text-2xl font-bold text-blue-400'>
                    {data?.local_station.aqi ?? 'N/A'}
                  </div>
                </div>
                <div className='bg-slate-800/50 rounded-lg p-3 border border-purple-500/30'>
                  <div className='text-xs text-gray-400 mb-1'>
                    Satellite (TEMPO)
                  </div>
                  <div className='text-2xl font-bold text-purple-400'>
                    {data?.tempo.area_summary
                      ? data?.tempo.area_summary.max_aqi
                      : 'N/A'}
                  </div>
                </div>
              </div>
              <p className='text-xs text-gray-500 mt-3'>
                <Eye className='w-3 h-3 inline mr-1' />
                Combining ground and satellite data provides the most accurate
                air quality assessment
              </p>
            </div>
          </div>
        </div>

        <div className='bg-slate-800/60 backdrop-blur-sm rounded-2xl p-5 mb-6 border border-slate-700/50 shadow-xl'>
          <div className='flex items-center gap-2 mb-4'>
            <Layers className='w-5 h-5 text-blue-400' />
            <h3 className='font-semibold text-gray-300'>AQI Scale Reference</h3>
          </div>
          {isFetchingCategories ? (
            <p>Loading categories...</p>
          ) : error ? (
            <p className='text-red-400'>Error loading categories</p>
          ) : (
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3'>
              {categories && categories.length > 0 ? (
                categories.map((item, i) => (
                  <div
                    key={i}
                    className='bg-slate-900/50 rounded-lg p-3 text-center border border-slate-700/50'
                  >
                    <div
                      className='w-full h-2 rounded-full mb-2'
                      style={{ backgroundColor: item.color }}
                    />
                    <div className='text-xs font-semibold text-gray-300'>
                      {item.range}
                    </div>
                    <div className='text-xs text-gray-500 mt-1'>
                      {item.name}
                    </div>
                  </div>
                ))
              ) : (
                <div className='w-full justify-center items-center'>
                  <p className='text-sm text-gray-400'>
                    No categories available
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className='bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-slate-700/50 shadow-2xl'>
          <div className='flex items-center justify-between mb-5'>
            <h2 className='text-xl font-semibold flex items-center gap-2'>
              <Layers className='w-6 h-6 text-blue-400' />
              Interactive Air Quality Map
            </h2>
            <div className='flex items-center gap-2 text-xs text-gray-400 bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-700'>
              <div className='w-3 h-3 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-600' />
              <span>TEMPO Satellite Overlay</span>
            </div>
          </div>
          <div
            className='rounded-xl overflow-hidden border-2 border-slate-700/70 shadow-2xl'
            style={{ height: '600px' }}
          >
            <MapboxView
              locations={data?.tempo.data_points ?? []}
              onLocationSelect={handleLocationSelect}
              selectedLocation={selectedLocation}
            />
          </div>
          <div className='mt-4 flex items-start gap-2 text-sm text-gray-400 bg-slate-900/30 p-3 rounded-lg border border-slate-700/50'>
            <Info className='w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5' />
            <span>
              Click on any location marker to view detailed AQI information. The
              heatmap overlay represents NASA TEMPO satellite measurements
              showing pollution distribution across the region.
            </span>
          </div>
        </div>

        <div className='bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-2xl'>
          <div className='flex items-center justify-between mb-5'>
            <h2 className='text-xl font-semibold flex items-center gap-2'>
              <Calendar className='w-6 h-6 text-blue-400' />
              72-Hour Air Quality Forecast
            </h2>
            <Button
              onClick={handleGetForecast}
              disabled={forecastMutation.isPending}
              className='bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg'
            >
              <TrendingUp className='w-4 h-4' />
              {forecastMutation.isPending ? 'Generating...' : 'Get AI Forecast'}
            </Button>
          </div>
          <div className='grid md:grid-cols-3 gap-5'>
            {forecast.map((day, i) => (
              <div
                key={i}
                className='bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-xl p-5 border border-slate-600/50 hover:border-slate-500 transition-all shadow-lg hover:shadow-xl'
              >
                <LastUpdated lastUpdated={day.date} />
                <div className='flex items-center gap-4 mb-4'>
                  <div
                    className='text-5xl font-bold'
                    style={{ color: getAQIColor(day.aqi_max) }}
                  >
                    {day.aqi_max}
                  </div>
                  <div className='flex-1'>
                    <div
                      className='text-sm font-semibold mb-1'
                      style={{ color: getAQIColor(day.aqi_max) }}
                    >
                      {day.category}
                    </div>
                    <div
                      className='h-2 rounded-full'
                      style={{ backgroundColor: getAQIColor(day.aqi_max) }}
                    />
                  </div>
                </div>
                <div className='bg-slate-900/50 rounded-lg p-3 border border-slate-700/50'>
                  <div className='text-xs text-gray-300 leading-relaxed'>
                    {day.health_advice}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Health Advice Modal */}
      <HealthAdviceModal
        isOpen={showHealthAdviceModal}
        onClose={() => setShowHealthAdviceModal(false)}
        advice={healthAdviceData}
        isLoading={healthAdviceMutation.isPending}
      />

      {/* Forecast Modal */}
      <ForecastModal
        isOpen={showForecastModal}
        onClose={() => setShowForecastModal(false)}
        forecast={forecastData}
        isLoading={forecastMutation.isPending}
        location={data?.local_station.city}
      />
    </>
  );
};

export default HomePage;
