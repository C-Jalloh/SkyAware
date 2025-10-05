import React from 'react';

import { LogOutIcon } from 'lucide-react';
import { signOut } from 'next-auth/react';

import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

export function LogOutConfirmation() {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/dashboard' });
    setIsOpen(false);
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='flex items-center gap-2 w-full justify-start'
        >
          <LogOutIcon />
          Log out
        </Button>
      </DialogTrigger>
      <DialogContent className='bg-slate-800/60 backdrop-blur-sm border border-blue-500/30'>
        <DialogHeader>
          <DialogTitle>Ready to leave?</DialogTitle>
          <DialogDescription>
            This action will log you out of the app.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='flex justify-end items-center gap-4'>
          <Button
            size='sm'
            className='bg-gray-200 text-slate-700 rounded-md'
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            size='sm'
            className='bg-blue-700/30 rounded-md'
            onClick={handleLogout}
          >
            <LogOutIcon /> Log Out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
