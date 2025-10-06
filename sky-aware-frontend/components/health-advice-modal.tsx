'use client';

import {
  X,
  Heart,
  AlertTriangle,
  Shield,
  Home,
  Activity,
  Utensils,
  Stethoscope,
  Clock,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { HealthAdviceResponse } from '@/services/healthadvice';

interface HealthAdviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  advice: HealthAdviceResponse | null;
  isLoading: boolean;
}

const HealthAdviceModal = ({
  isOpen,
  onClose,
  advice,
  isLoading,
}: HealthAdviceModalProps) => {
  if (!isOpen) return null;

  const adviceSection = advice?.health_advice;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
      <div className='bg-slate-800 rounded-2xl p-6 m-4 max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <Heart className='w-6 h-6 text-red-400' />
            <h2 className='text-2xl font-bold text-white'>
              Personalized Health Advice
            </h2>
          </div>
          <Button
            onClick={onClose}
            size='icon'
            className='bg-slate-700 hover:bg-slate-600 text-white'
          >
            <X className='w-5 h-5' />
          </Button>
        </div>

        {isLoading ? (
          <div className='text-center py-8'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4' />
            <p className='text-gray-300'>
              Generating personalized health advice...
            </p>
          </div>
        ) : advice ? (
          <div className='space-y-6'>
            {/* Location & AQI Summary */}
            <div className='bg-slate-900/50 rounded-xl p-4 border border-slate-600'>
              <h3 className='font-semibold text-lg mb-2 text-white'>
                {advice.location.city}, {advice.location.state}
              </h3>
              <div className='flex items-center gap-4'>
                <div
                  className='px-4 py-2 rounded-lg font-bold'
                  style={{
                    backgroundColor: `${advice.air_quality_summary.color}20`,
                    color: advice.air_quality_summary.color,
                    borderColor: advice.air_quality_summary.color,
                  }}
                >
                  AQI {advice.air_quality_summary.primary_aqi} -{' '}
                  {advice.air_quality_summary.category}
                </div>
                <span className='text-gray-300'>
                  Primary Pollutant: {advice.air_quality_summary.pollutant}
                </span>
              </div>
            </div>

            {/* Overall Assessment */}
            <div className='bg-gradient-to-br from-red-900/30 to-orange-900/30 rounded-xl p-4 border border-red-700/50'>
              <div className='flex items-start gap-3'>
                <AlertTriangle className='w-6 h-6 text-red-400 flex-shrink-0 mt-1' />
                <div>
                  <h3 className='font-semibold text-lg mb-2 text-red-300'>
                    Overall Assessment
                  </h3>
                  <p className='text-gray-200 leading-relaxed whitespace-pre-line'>
                    {adviceSection?.overall_assessment}
                  </p>
                </div>
              </div>
            </div>

            {/* Immediate Actions */}
            <div className='bg-gradient-to-br from-yellow-900/30 to-orange-900/30 rounded-xl p-4 border border-yellow-700/50'>
              <div className='flex items-start gap-3'>
                <AlertTriangle className='w-6 h-6 text-yellow-400 flex-shrink-0 mt-1' />
                <div>
                  <h3 className='font-semibold text-lg mb-2 text-yellow-300'>
                    Immediate Actions
                  </h3>
                  <p className='text-gray-200 leading-relaxed whitespace-pre-line'>
                    {adviceSection?.immediate_actions}
                  </p>
                </div>
              </div>
            </div>

            {/* Grid for other advice sections */}
            <div className='grid md:grid-cols-2 gap-4'>
              <div className='bg-slate-900/50 rounded-xl p-4 border border-slate-600'>
                <div className='flex items-start gap-3'>
                  <Activity className='w-5 h-5 text-blue-400 flex-shrink-0 mt-1' />
                  <div>
                    <h4 className='font-semibold mb-2 text-blue-300'>
                      Outdoor Activities
                    </h4>
                    <p className='text-gray-300 text-sm leading-relaxed whitespace-pre-line'>
                      {adviceSection?.outdoor_activities}
                    </p>
                  </div>
                </div>
              </div>

              <div className='bg-slate-900/50 rounded-xl p-4 border border-slate-600'>
                <div className='flex items-start gap-3'>
                  <Shield className='w-5 h-5 text-green-400 flex-shrink-0 mt-1' />
                  <div>
                    <h4 className='font-semibold mb-2 text-green-300'>
                      Protection Measures
                    </h4>
                    <p className='text-gray-300 text-sm leading-relaxed whitespace-pre-line'>
                      {adviceSection?.protection_measures}
                    </p>
                  </div>
                </div>
              </div>

              <div className='bg-slate-900/50 rounded-xl p-4 border border-slate-600'>
                <div className='flex items-start gap-3'>
                  <Home className='w-5 h-5 text-purple-400 flex-shrink-0 mt-1' />
                  <div>
                    <h4 className='font-semibold mb-2 text-purple-300'>
                      Indoor Recommendations
                    </h4>
                    <p className='text-gray-300 text-sm leading-relaxed whitespace-pre-line'>
                      {adviceSection?.indoor_recommendations}
                    </p>
                  </div>
                </div>
              </div>

              <div className='bg-slate-900/50 rounded-xl p-4 border border-slate-600'>
                <div className='flex items-start gap-3'>
                  <Utensils className='w-5 h-5 text-orange-400 flex-shrink-0 mt-1' />
                  <div>
                    <h4 className='font-semibold mb-2 text-orange-300'>
                      Recovery Advice
                    </h4>
                    <p className='text-gray-300 text-sm leading-relaxed whitespace-pre-line'>
                      {adviceSection?.recovery_advice}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Guidance */}
            <div className='bg-gradient-to-br from-red-900/20 to-pink-900/20 rounded-xl p-4 border border-red-600/50'>
              <div className='flex items-start gap-3'>
                <Stethoscope className='w-6 h-6 text-red-400 flex-shrink-0 mt-1' />
                <div>
                  <h3 className='font-semibold text-lg mb-2 text-red-300'>
                    Medical Guidance
                  </h3>
                  <p className='text-gray-200 leading-relaxed whitespace-pre-line'>
                    {adviceSection?.medical_guidance}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer with timestamp and personalization info */}
            <div className='bg-slate-900/30 rounded-lg p-3 border border-slate-700'>
              <div className='flex items-center justify-between text-sm text-gray-400'>
                <div className='flex items-center gap-2'>
                  <Clock className='w-4 h-4' />
                  <span>
                    Generated: {new Date(advice.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  {advice.user_profile.personalized ? (
                    <span className='text-green-400'>✓ Personalized</span>
                  ) : (
                    <span className='text-yellow-400'>⚠ General advice</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className='text-center py-8'>
            <p className='text-gray-300'>
              Failed to load health advice. Please try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthAdviceModal;
