'use client';

import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { X, Menu, User2Icon, CogIcon, LogInIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';

import Logo from './logo';
import { LogOutConfirmation } from './logout-confirmation';
import Notifications from './notifications';
import Profile from './profile';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const Header = () => {
  const [openMenu, setMenuOpen] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const pathname = usePathname();

  const { data: user, status } = useSession();

  const toggleMenu = () => {
    setMenuOpen(!openMenu);
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className='bg-slate-900/90 backdrop-blur-md border-b border-blue-500/30 sticky top-0 z-50 shadow-xl'>
      <div className='max-w-7xl mx-auto px-4 py-4 flex items-center justify-between'>
        <Link href='/dashboard' className='flex items-center gap-2'>
          <Logo />
        </Link>

        <nav
          className={`${
            openMenu ? 'flex' : 'hidden'
          } ml-auto md:flex flex-col md:flex-row absolute md:relative top-full left-0 right-0 md:top-0 justify-end items-center bg-slate-900 md:bg-transparent gap-2 md:gap-4 p-4 md:p-0 border-b md:border-0 border-slate-700 shadow-xl md:shadow-none`}
        >
          <Button
            asChild
            variant='ghost'
            className={`px-6 py-2 rounded-lg transition-all text-gray-50 ${
              isActive('/dashboard')
                ? 'bg-blue-600 shadow-lg shadow-blue-600/50 hover:bg-blue-700'
                : 'hover:bg-slate-800'
            }`}
          >
            <Link href='/dashboard'>Dashboard</Link>
          </Button>
          <Button
            asChild
            variant='ghost'
            className={`px-6 py-2 rounded-lg transition-all text-gray-50 ${
              isActive('/education')
                ? 'bg-blue-600 shadow-lg shadow-blue-600/50 hover:bg-blue-700'
                : 'hover:bg-slate-800'
            }`}
          >
            <Link href='/education'>Educational</Link>
          </Button>
        </nav>

        <div className='flex flex-row items-center gap-4'>
          {user && status === 'authenticated' ? (
            <>
              <Notifications />

              <DropdownMenu
                open={isDropdownOpen}
                onOpenChange={setIsDropdownOpen}
              >
                <DropdownMenuTrigger className='w-12 h-12 flex justify-center items-center rounded-full cursor-pointer select-none'>
                  <Profile fullName={user?.user.name ?? 'NO'} />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className='bg-slate-800/60 backdrop-blur-sm  w-56 border-blue-500/30'
                  align='end'
                >
                  <DropdownMenuLabel className='text-gray-50 font-bold'>
                    My Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className='bg-blue-500/30' />
                  <DropdownMenuGroup className='text-gray-50'>
                    <DropdownMenuItem>
                      <User2Icon />
                      Yombeh Cham
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                      <Link
                        href='/settings'
                        className='flex items-center gap-2'
                      >
                        <CogIcon />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator className='bg-blue-500/30' />

                  <DropdownMenuItem asChild>
                    <LogOutConfirmation />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button size='lg' variant='ghost' className='text-gray-50'>
              <Link
                href='/login'
                className='w-full flex justify-center items-center gap-2'
              >
                <LogInIcon size={30} />
                <span className='hidden sm:block text-md'>Login</span>
              </Link>
            </Button>
          )}

          <Button
            onClick={() => {
              toggleMenu();
              setIsDropdownOpen(false);
            }}
            className='md:hidden p-2 rounded-lg hover:bg-slate-800 transition-colors'
            variant='ghost'
          >
            {openMenu ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
