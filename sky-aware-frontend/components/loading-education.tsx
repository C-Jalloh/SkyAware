import React from 'react';

import { Skeleton } from '@/components/ui/skeleton';

const EducationPageSkeleton = () => {
  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <div className='bg-slate-800/60 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50 shadow-2xl'>
        {/* Header Skeleton */}
        <div className='flex items-center gap-3 mb-8'>
          <Skeleton className='w-10 h-10 rounded-lg bg-slate-700/50' />
          <Skeleton className='h-10 w-96 bg-slate-700/50' />
        </div>

        <div className='space-y-8'>
          {/* NASA TEMPO Section */}
          <section className='bg-gradient-to-br from-blue-900/40 to-slate-800/40 rounded-2xl p-6 border border-blue-500/30'>
            <div className='flex items-center gap-2 mb-4'>
              <Skeleton className='w-6 h-6 rounded bg-slate-700/50' />
              <Skeleton className='h-8 w-64 bg-slate-700/50' />
            </div>
            <Skeleton className='h-4 w-full mb-2 bg-slate-700/50' />
            <Skeleton className='h-4 w-full mb-2 bg-slate-700/50' />
            <Skeleton className='h-4 w-3/4 mb-4 bg-slate-700/50' />

            {/* Grid Cards */}
            <div className='grid md:grid-cols-2 gap-4 mt-4'>
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className='bg-slate-900/50 rounded-lg p-4 border border-blue-500/20'
                >
                  <Skeleton className='h-5 w-32 mb-2 bg-slate-700/50' />
                  <Skeleton className='h-3 w-full bg-slate-700/50' />
                </div>
              ))}
            </div>
          </section>

          {/* What is AQI Section */}
          <section>
            <Skeleton className='h-8 w-48 mb-4 bg-slate-700/50' />
            <Skeleton className='h-4 w-full mb-2 bg-slate-700/50' />
            <Skeleton className='h-4 w-full mb-2 bg-slate-700/50' />
            <Skeleton className='h-4 w-5/6 bg-slate-700/50' />
          </section>

          {/* AQI Categories Section */}
          <section>
            <Skeleton className='h-8 w-72 mb-4 bg-slate-700/50' />
            <div className='space-y-3'>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div
                  key={i}
                  className='flex items-center gap-4 p-5 bg-slate-700/30 rounded-xl border border-slate-600/50'
                >
                  <Skeleton className='w-20 h-20 rounded-xl bg-slate-700/50' />
                  <div className='flex-1 space-y-2'>
                    <Skeleton className='h-6 w-48 bg-slate-700/50' />
                    <Skeleton className='h-4 w-full bg-slate-700/50' />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Key Air Pollutants Section */}
          <section>
            <Skeleton className='h-8 w-56 mb-4 bg-slate-700/50' />
            <div className='grid md:grid-cols-2 gap-4'>
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className='bg-gradient-to-br from-slate-800/30 to-slate-900/30 p-5 rounded-xl border border-slate-600/30'
                >
                  <div className='flex items-center gap-2 mb-2'>
                    <Skeleton className='w-5 h-5 rounded bg-slate-700/50' />
                    <Skeleton className='h-6 w-40 bg-slate-700/50' />
                  </div>
                  <Skeleton className='h-3 w-full mb-2 bg-slate-700/50' />
                  <Skeleton className='h-3 w-5/6 mb-2 bg-slate-700/50' />
                  <Skeleton className='h-3 w-full bg-slate-700/50' />
                </div>
              ))}
            </div>
          </section>

          {/* Data Sources Section */}
          <section className='bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-2xl p-6 border border-slate-600/50'>
            <Skeleton className='h-7 w-64 mb-4 bg-slate-700/50' />
            <div className='space-y-2'>
              <Skeleton className='h-3 w-full bg-slate-700/50' />
              <Skeleton className='h-3 w-full bg-slate-700/50' />
              <Skeleton className='h-3 w-3/4 bg-slate-700/50' />
              <Skeleton className='h-3 w-full mt-4 bg-slate-700/50' />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default EducationPageSkeleton;
