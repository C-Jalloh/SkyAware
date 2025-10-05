'use client';
import { useEffect, useState } from 'react';

export default function LastUpdated({ lastUpdated }: { lastUpdated: string }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    setTime(new Date(lastUpdated).toLocaleTimeString());
  }, [lastUpdated]);

  return (
    <div className='text-xs text-gray-500 text-right'>
      <div>Last Updated</div>
      <div className='font-medium'>{time}</div>
    </div>
  );
}
