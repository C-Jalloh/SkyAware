'use client';

import React from 'react';

import Link from 'next/link';

import { CogIcon } from 'lucide-react';

import NotificationIcon from './svgs/NotificationIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const Notifications = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className='border-none bg-transparent hover:bg-transparent'
        asChild
      >
        <button className='relative  bg-transparent hover:bg-transparent border-none md:mr-6'>
          <NotificationIcon width={60} hanging={60} />
          <span className='absolute top-1 right-1 w-4 h-4 text-xs text-white flex justify-center items-center bg-red-500 rounded-full animate-pulse'>
            3
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='bg-slate-800/60 backdrop-blur-sm  w-56 border-blue-500/30'
        align='end'
      >
        <DropdownMenuLabel className='text-gray-50 font-bold'>
          Recent Notifications
        </DropdownMenuLabel>
        <DropdownMenuSeparator className='bg-blue-500/30' />
        <DropdownMenuGroup className='text-gray-50'>
          <DropdownMenuItem>
            <Link href='/' className='flex items-center gap-2'>
              <CogIcon />
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className='bg-blue-500/30' />

        <DropdownMenuItem asChild>
          <Link href='/' className='w-full flex items-center gap-2'>
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Notifications;
