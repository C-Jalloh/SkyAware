import React from 'react';

import { redirect } from 'next/navigation';

import { getServerSession } from 'next-auth';

import { LoginForm } from '@/components/login-form';

const LoginPage = async () => {
  const session = await getServerSession();

  if (session) {
    redirect('/dashboard');
  }
  return (
    <div className='w-full max-w-sm'>
      <LoginForm />
    </div>
  );
};

export default LoginPage;
