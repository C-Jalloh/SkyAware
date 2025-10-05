'use client';
import React, { type Dispatch, type SetStateAction } from 'react';

import { MapPin, Navigation } from 'lucide-react';

import { Button } from './ui/button';

type SearchBoxProps = {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

const SearchBox = ({
  searchQuery,
  setSearchQuery,
  onClick,
}: Readonly<SearchBoxProps>) => {
  return (
    <div className='mb-6'>
      <div className='bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50 shadow-xl'>
        <div className='flex items-center gap-3'>
          <MapPin className='w-5 h-5 text-blue-400' />
          <input
            type='text'
            placeholder='Search for a city or location...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='flex-1 bg-slate-900/50 text-white placeholder-gray-500 px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none transition-colors'
          />
          <Button
            onClick={onClick}
            className='px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50'
          >
            <Navigation className='w-4 h-4' />
            <span className='hidden sm:inline'>Use My Location</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchBox;
