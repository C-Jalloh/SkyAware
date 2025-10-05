'use client';

import React from 'react';

import { Info, Cloud, Wind } from 'lucide-react';

import ErrorComponent from '@/components/error';
import EducationPageSkeleton from '@/components/loading-education';
import { useFetchCategories } from '@/hooks/use-category';
import { getCategoryDescription } from '@/utils/helpers';

const EducationPage = () => {
  const {
    data: categories,
    isFetching: isFetchingCategories,
    error,
    refetch,
  } = useFetchCategories();

  if (isFetchingCategories) {
    return <EducationPageSkeleton />;
  }

  if (error) {
    return <ErrorComponent message={error?.message} onRefresh={refetch} />;
  }

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <div className='bg-slate-800/60 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50 shadow-2xl'>
        <h2 className='text-4xl font-bold mb-8 flex items-center gap-3 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent'>
          <Info className='w-10 h-10 text-blue-400' />
          Understanding Air Quality & NASA TEMPO
        </h2>

        <div className='space-y-8'>
          <section className='bg-gradient-to-br from-blue-900/40 to-slate-800/40 rounded-2xl p-6 border border-blue-500/30'>
            <h3 className='text-2xl font-semibold mb-4 text-blue-300 flex items-center gap-2'>
              <Cloud className='w-6 h-6' />
              What is NASA TEMPO?
            </h3>
            <p className='text-gray-300 leading-relaxed mb-4'>
              The Tropospheric Emissions: Monitoring of Pollution (TEMPO) is
              NASA's revolutionary space-based instrument that monitors air
              quality across North America with unprecedented detail. Unlike
              ground stations that provide point measurements, TEMPO gives us a
              comprehensive view from space.
            </p>
            <div className='grid md:grid-cols-2 gap-4 mt-4'>
              <div className='bg-slate-900/50 rounded-lg p-4 border border-blue-500/20'>
                <div className='text-blue-400 font-semibold mb-2'>
                  🛰️ Hourly Monitoring
                </div>
                <p className='text-sm text-gray-400'>
                  Updates every hour during daylight, providing real-time air
                  quality data
                </p>
              </div>
              <div className='bg-slate-900/50 rounded-lg p-4 border border-blue-500/20'>
                <div className='text-blue-400 font-semibold mb-2'>
                  📍 High Resolution
                </div>
                <p className='text-sm text-gray-400'>
                  2km × 4.5km spatial resolution for hyper-local accuracy
                </p>
              </div>
              <div className='bg-slate-900/50 rounded-lg p-4 border border-blue-500/20'>
                <div className='text-blue-400 font-semibold mb-2'>
                  🌎 Wide Coverage
                </div>
                <p className='text-sm text-gray-400'>
                  Monitors all of North America from geostationary orbit
                </p>
              </div>
              <div className='bg-slate-900/50 rounded-lg p-4 border border-blue-500/20'>
                <div className='text-blue-400 font-semibold mb-2'>
                  🔬 Multiple Pollutants
                </div>
                <p className='text-sm text-gray-400'>
                  Tracks NO₂, O₃, SO₂, HCHO, and aerosols
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className='text-2xl font-semibold mb-4 text-blue-300'>
              What is AQI?
            </h3>
            <p className='text-gray-300 leading-relaxed'>
              The Air Quality Index (AQI) is a standardized indicator that
              communicates how polluted the air currently is or how polluted it
              is forecast to become. The AQI translates complex air quality data
              into a simple number and color code that anyone can understand. It
              focuses on health effects you may experience within a few hours or
              days after breathing polluted air.
            </p>
          </section>

          <section>
            <h3 className='text-2xl font-semibold mb-4 text-blue-300'>
              AQI Categories & Health Guidance
            </h3>
            <div className='space-y-3'>
              {categories && categories.length > 0 ? (
                categories.map((item, i) => (
                  <div
                    key={i}
                    className='flex items-center gap-4 p-5 bg-slate-700/30 rounded-xl border border-slate-600/50 hover:border-slate-500 transition-all'
                  >
                    <div
                      className='w-20 h-20 rounded-xl flex items-center justify-center font-bold text-black shadow-lg'
                      style={{ backgroundColor: item.color }}
                    >
                      {item.range}
                    </div>
                    <div className='flex-1'>
                      <div className='font-semibold text-lg mb-1'>
                        {item.name}
                      </div>
                      <div className='text-sm text-gray-400'>
                        {getCategoryDescription(item.name)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className='w-full flex justify-center items-center'>
                  <p className='text-md font-bold text-gray-200'>
                    No categories
                  </p>
                </div>
              )}
            </div>
          </section>

          <section>
            <h3 className='text-2xl font-semibold mb-4 text-blue-300'>
              Key Air Pollutants
            </h3>
            <div className='grid md:grid-cols-2 gap-4'>
              <div className='bg-gradient-to-br from-orange-900/30 to-slate-800/30 p-5 rounded-xl border border-orange-500/30 hover:border-orange-500/50 transition-all'>
                <h4 className='font-semibold mb-2 text-orange-300 text-lg flex items-center gap-2'>
                  <Wind className='w-5 h-5' />
                  Ozone (O₃)
                </h4>
                <p className='text-sm text-gray-300 mb-2'>
                  <strong>Source:</strong> Forms when pollutants from cars,
                  power plants, and industry react in sunlight.
                </p>
                <p className='text-sm text-gray-400'>
                  <strong>Health Impact:</strong> Aggravates asthma, reduces
                  lung function, causes respiratory inflammation.
                </p>
              </div>
              <div className='bg-gradient-to-br from-red-900/30 to-slate-800/30 p-5 rounded-xl border border-red-500/30 hover:border-red-500/50 transition-all'>
                <h4 className='font-semibold mb-2 text-red-300 text-lg flex items-center gap-2'>
                  <Wind className='w-5 h-5' />
                  Nitrogen Dioxide (NO₂)
                </h4>
                <p className='text-sm text-gray-300 mb-2'>
                  <strong>Source:</strong> Vehicle emissions, power plants, and
                  industrial facilities.
                </p>
                <p className='text-sm text-gray-400'>
                  <strong>Health Impact:</strong> Irritates airways, worsens
                  respiratory diseases, increases infection susceptibility.
                </p>
              </div>
              <div className='bg-gradient-to-br from-yellow-900/30 to-slate-800/30 p-5 rounded-xl border border-yellow-500/30 hover:border-yellow-500/50 transition-all'>
                <h4 className='font-semibold mb-2 text-yellow-300 text-lg flex items-center gap-2'>
                  <Wind className='w-5 h-5' />
                  Particulate Matter (PM2.5)
                </h4>
                <p className='text-sm text-gray-300 mb-2'>
                  <strong>Source:</strong> Combustion (vehicles, wildfires),
                  industrial processes, dust.
                </p>
                <p className='text-sm text-gray-400'>
                  <strong>Health Impact:</strong> Penetrates deep into lungs and
                  bloodstream, causes cardiovascular issues.
                </p>
              </div>
              <div className='bg-gradient-to-br from-blue-900/30 to-slate-800/30 p-5 rounded-xl border border-blue-500/30 hover:border-blue-500/50 transition-all'>
                <h4 className='font-semibold mb-2 text-blue-300 text-lg flex items-center gap-2'>
                  <Wind className='w-5 h-5' />
                  Carbon Monoxide (CO)
                </h4>
                <p className='text-sm text-gray-300 mb-2'>
                  <strong>Source:</strong> Incomplete combustion in vehicles,
                  stoves, and heaters.
                </p>
                <p className='text-sm text-gray-400'>
                  <strong>Health Impact:</strong> Reduces oxygen delivery to
                  organs and tissues, dangerous in enclosed spaces.
                </p>
              </div>
            </div>
          </section>

          <section className='bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-2xl p-6 border border-slate-600/50'>
            <h3 className='text-xl font-semibold mb-4 text-cyan-300'>
              Data Sources & Citations
            </h3>
            <div className='space-y-2 text-sm text-gray-400'>
              <p>
                • <strong>NASA TEMPO Mission:</strong> Satellite-based air
                quality monitoring data
              </p>
              <p>
                • <strong>EPA AirNow:</strong> Ground station measurements and
                AQI standards
              </p>
              <p>
                • <strong>WHO:</strong> Health guidance and air quality
                standards
              </p>
              <p className='mt-4 text-xs'>
                This application combines satellite and ground-based
                measurements to provide the most accurate air quality
                information available.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default EducationPage;
