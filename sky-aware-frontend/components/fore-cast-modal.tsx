'use client';

import { X, Calendar, TrendingUp, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ForecastResponse } from '@/services/forecast';
import { getAQIColor, getAQICategory } from '@/mocks';

interface ForecastModalProps {
  isOpen: boolean;
  onClose: () => void;
  forecast: ForecastResponse | null;
  isLoading: boolean;
  location?: string;
}

const ForecastModal = ({ isOpen, onClose, forecast, isLoading, location }: ForecastModalProps) => {
  if (!isOpen) return null;

  // Helper function to get day name from date
  const getDayName = (dateString: string, index: number) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl p-6 m-4 max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">
              AI-Powered Air Quality Forecast
            </h2>
          </div>
          <Button
            onClick={onClose}
            size="icon"
            className="bg-slate-700 hover:bg-slate-600 text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-300">Generating AI-powered forecast...</p>
          </div>
        ) : forecast ? (
          <div className="space-y-6">
            {/* Location & Timestamp */}
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">
                    {location || (forecast.location ? `${forecast.location.lat.toFixed(4)}, ${forecast.location.lon.toFixed(4)}` : 'Current Location')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>Generated: {new Date(forecast.generated_at).toLocaleString()}</span>
                </div>
              </div>
              {forecast.model_version && (
                <div className="mt-2 text-xs text-gray-500">
                  Model: {forecast.model_version}
                </div>
              )}
            </div>

            {/* Error Display */}
            {forecast.error && (
              <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-300 font-medium">Note: Using fallback data</span>
                </div>
                <p className="text-gray-300 text-sm mt-2">{forecast.error}</p>
              </div>
            )}

            {/* Forecast Cards */}
            <div className="grid gap-4">
              {forecast?.forecast_days && Array.isArray(forecast.forecast_days) && forecast.forecast_days.length > 0 ? (
                forecast.forecast_days.map((day, index) => {
                  const aqiColor = getAQIColor(day.aqi_max);
                  const aqiCategory = getAQICategory(day.aqi_max);
                  const dayName = getDayName(day.date, index);

                  return (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-xl p-5 border border-slate-600/50 hover:border-slate-500 transition-all shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-300">{dayName}</div>
                            <div className="text-sm text-gray-500">{new Date(day.date).toLocaleDateString()}</div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div
                              className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-bold border-2 shadow-lg"
                              style={{
                                backgroundColor: `${aqiColor}20`,
                                borderColor: aqiColor,
                              }}
                            >
                              <div
                                className="text-2xl font-bold"
                                style={{ color: aqiColor }}
                              >
                                {day.aqi_max}
                              </div>
                              <div className="text-xs text-gray-300">AQI</div>
                            </div>
                            
                            <div>
                              <div className="text-sm text-gray-400 mb-1">Category</div>
                              <div
                                className="text-xl font-bold"
                                style={{ color: aqiColor }}
                              >
                                {aqiCategory}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Trend indicator */}
                        <div className="flex items-center gap-2">
                          {index > 0 && forecast.forecast_days && forecast.forecast_days[index - 1] && (
                            <div className="flex items-center gap-1">
                              <TrendingUp 
                                className={`w-4 h-4 ${
                                  day.aqi_max > forecast.forecast_days[index - 1].aqi_max 
                                    ? 'text-red-400 rotate-0' 
                                    : day.aqi_max < forecast.forecast_days[index - 1].aqi_max
                                    ? 'text-green-400 rotate-180'
                                    : 'text-gray-400'
                                }`} 
                              />
                              <span className="text-xs text-gray-400">
                                {day.aqi_max > forecast.forecast_days[index - 1].aqi_max ? '+' : ''}
                                {day.aqi_max - forecast.forecast_days[index - 1].aqi_max}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Health Advice */}
                      <div className="mt-4 bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                        <div className="text-sm text-gray-300 leading-relaxed">
                          {day.health_advice_text}
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-4">
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                              backgroundColor: aqiColor,
                              width: `${Math.min((day.aqi_max / 300) * 100, 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-300">No forecast data available.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-900/30 rounded-lg p-3 border border-slate-700">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>AI-Powered Forecast</span>
                  {forecast.model_version && (
                    <span className="text-xs">({forecast.model_version})</span>
                  )}
                </div>
                {forecast?.user?.authenticated && (
                  <span className="text-green-400">✓ Personalized for {forecast.user.name}</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-300">Failed to load forecast. Please try again.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForecastModal;