import { Skeleton } from '@/components/ui/skeleton';

const DashboardSkeleton = () => {
  return (
    <div className='max-w-7xl mx-auto px-4 py-6'>
      {/* Search Box Skeleton */}
      <div className='mb-6'>
        <Skeleton className='h-12 w-full rounded-xl bg-slate-700/50' />
      </div>

      {/* Current Air Quality Card Skeleton */}
      <div className='bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-slate-700/50'>
        <div className='flex items-start justify-between mb-6'>
          <div>
            <Skeleton className='h-7 w-48 mb-2 bg-slate-700/50' />
            <Skeleton className='h-4 w-32 bg-slate-700/50' />
          </div>
          <div className='text-right'>
            <Skeleton className='h-3 w-24 mb-1 bg-slate-700/50' />
            <Skeleton className='h-3 w-20 bg-slate-700/50' />
          </div>
        </div>

        <div className='grid md:grid-cols-3 gap-6'>
          {/* AQI Circle Skeleton */}
          <div className='flex items-center justify-center'>
            <Skeleton className='w-40 h-40 rounded-3xl bg-slate-700/50' />
          </div>

          {/* Category & Pollutant Info Skeleton */}
          <div className='flex flex-col justify-center space-y-4'>
            <div>
              <Skeleton className='h-4 w-24 mb-2 bg-slate-700/50' />
              <Skeleton className='h-9 w-32 bg-slate-700/50' />
            </div>
            <div>
              <Skeleton className='h-4 w-32 mb-2 bg-slate-700/50' />
              <Skeleton className='h-6 w-24 bg-slate-700/50' />
            </div>
          </div>

          {/* Health Advice Skeleton */}
          <div className='flex flex-col justify-center'>
            <div className='bg-gradient-to-br from-slate-700/40 to-slate-800/40 border border-slate-600/50 rounded-xl p-4'>
              <Skeleton className='h-5 w-32 mb-3 bg-slate-700/50' />
              <Skeleton className='h-4 w-full mb-2 bg-slate-700/50' />
              <Skeleton className='h-4 w-full mb-2 bg-slate-700/50' />
              <Skeleton className='h-4 w-3/4 bg-slate-700/50' />
            </div>
          </div>
        </div>

        {/* Data Validation Skeleton */}
        <div className='mt-6 pt-6 border-t border-slate-700'>
          <div className='bg-slate-900/50 rounded-xl p-4 border border-slate-600/50'>
            <Skeleton className='h-5 w-40 mb-3 bg-slate-700/50' />
            <div className='grid grid-cols-2 gap-4'>
              <div className='bg-slate-800/50 rounded-lg p-3 border border-slate-600/30'>
                <Skeleton className='h-3 w-32 mb-2 bg-slate-700/50' />
                <Skeleton className='h-8 w-16 bg-slate-700/50' />
              </div>
              <div className='bg-slate-800/50 rounded-lg p-3 border border-slate-600/30'>
                <Skeleton className='h-3 w-32 mb-2 bg-slate-700/50' />
                <Skeleton className='h-8 w-16 bg-slate-700/50' />
              </div>
            </div>
            <Skeleton className='h-3 w-full mt-3 bg-slate-700/50' />
          </div>
        </div>
      </div>

      {/* AQI Scale Reference Skeleton */}
      <div className='bg-slate-800/60 backdrop-blur-sm rounded-2xl p-5 mb-6 border border-slate-700/50'>
        <Skeleton className='h-5 w-40 mb-4 bg-slate-700/50' />
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3'>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className='bg-slate-900/50 rounded-lg p-3 text-center border border-slate-700/50'
            >
              <Skeleton className='w-full h-2 rounded-full mb-2 bg-slate-700/50' />
              <Skeleton className='h-3 w-12 mx-auto mb-1 bg-slate-700/50' />
              <Skeleton className='h-3 w-16 mx-auto bg-slate-700/50' />
            </div>
          ))}
        </div>
      </div>

      {/* Map Skeleton */}
      <div className='bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-slate-700/50'>
        <div className='flex items-center justify-between mb-5'>
          <Skeleton className='h-7 w-64 bg-slate-700/50' />
          <Skeleton className='h-8 w-48 rounded-lg bg-slate-700/50' />
        </div>
        <Skeleton className='w-full h-[600px] rounded-xl bg-slate-700/50' />
        <div className='mt-4'>
          <Skeleton className='h-16 w-full rounded-lg bg-slate-700/50' />
        </div>
      </div>

      {/* Forecast Skeleton */}
      <div className='bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50'>
        <Skeleton className='h-7 w-64 mb-5 bg-slate-700/50' />
        <div className='grid md:grid-cols-3 gap-5'>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className='bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-xl p-5 border border-slate-600/50'
            >
              <Skeleton className='h-4 w-32 mb-3 bg-slate-700/50' />
              <div className='flex items-center gap-4 mb-4'>
                <Skeleton className='h-14 w-14 bg-slate-700/50' />
                <div className='flex-1'>
                  <Skeleton className='h-4 w-24 mb-2 bg-slate-700/50' />
                  <Skeleton className='h-2 w-full rounded-full bg-slate-700/50' />
                </div>
              </div>
              <div className='bg-slate-900/50 rounded-lg p-3 border border-slate-700/50'>
                <Skeleton className='h-3 w-full mb-2 bg-slate-700/50' />
                <Skeleton className='h-3 w-full mb-2 bg-slate-700/50' />
                <Skeleton className='h-3 w-3/4 bg-slate-700/50' />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
