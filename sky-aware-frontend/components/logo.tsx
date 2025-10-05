'use client';

import React from 'react';

import { CloudIcon } from './svgs';

const Logo = () => {
  return (
    <div className='flex justify-items-start items-center gap-3'>
      <div className='relative'>
        <CloudIcon className='w-10 h-10 text-blue-400' />
        <div className='absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse' />
      </div>
      <div>
        <h1 className=' text-2xl font-bold tracking-tight hidden md:block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent'>
          SkyAware
        </h1>
        <p className='text-xs text-gray-400 hidden md:block'>
          Powered by NASA TEMPO
        </p>
      </div>
    </div>
  );
};

export default Logo;
