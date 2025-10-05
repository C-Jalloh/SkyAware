import React from 'react';

const Footer = () => {
  return (
    <footer className='bg-slate-900/90 backdrop-blur-sm border-t border-slate-700/50 mt-12 py-8'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='grid md:grid-cols-3 gap-6 mb-6'>
          <div>
            <h3 className='font-semibold mb-2 text-blue-400'>Data Sources</h3>
            <ul className='text-sm text-gray-400 space-y-1'>
              <li>• NASA TEMPO Mission</li>
              <li>• EPA AirNow Network</li>
              <li>• OpenWeatherMap API</li>
            </ul>
          </div>
          <div>
            <h3 className='font-semibold mb-2 text-blue-400'>About</h3>
            <p className='text-sm text-gray-400'>
              SkyAware combines satellite and ground-based measurements to
              provide real-time air quality information for your location.
            </p>
          </div>
          <div>
            <h3 className='font-semibold mb-2 text-blue-400'>Citations</h3>
            <ul className='text-sm text-gray-400 space-y-1'>
              <li>• WHO Air Quality Guidelines</li>
              <li>• EPA AQI Standards</li>
              <li>• NASA Earth Science Division</li>
            </ul>
          </div>
        </div>
        <div className='text-center text-sm text-gray-500 pt-6 border-t border-slate-800'>
          <p className='mb-1'>NASA Space Apps Challenge 2025 | SkyAware Team</p>
          <p className='text-xs'>
            Empowering communities with actionable air quality data
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
