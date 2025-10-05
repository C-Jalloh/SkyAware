/* eslint-disable no-alert */
'use client';

import { useState } from 'react';

import Link from 'next/link';

import { zodResolver } from '@hookform/resolvers/zod';
import { HomeIcon, Lock, Mail } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from '@/components/ui/field';
import { cn } from '@/lib/utils';
import loginFormSchema, {
  type LoginFormValues,
} from '@/utils/schemas/login-schema';

import TextInputField from './form/text-input-field';
import Logo from './logo';
import { Form } from './ui/form';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // 2. Define a submit handler.
  function onSubmit(values: LoginFormValues) {
    try {
      const result = signIn('credentials', {
        redirect: true,
        email: values.email,
        password: values.password,
        callbackUrl: '/dashboard',
      });

      if (!result) {
        alert(`Error logging in`);
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Error logging in. Please try again.');
    }
  }
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <FieldGroup>
            <div className='flex flex-col items-center gap-2'>
              <Link
                href='/dashboard'
                className='flex flex-col items-center gap-2 font-medium'
              >
                <Logo />
              </Link>
              <FieldDescription className='font-medium text-md'>
                Don&apos;t have an account?{' '}
                <Link href='/create-account'>Create an account</Link>
              </FieldDescription>
            </div>
            <Field>
              <TextInputField
                prefixIcon={Mail}
                label='Email'
                name='email'
                placeholder='Enter email'
                type='email'
              />

              <TextInputField
                prefixIcon={Lock}
                label='Password'
                name='password'
                placeholder='Your password'
                type='password'
                togglePassword={togglePasswordVisibility}
                secureEntry
                isPasswordVisible={showPassword}
              />
            </Field>
            <Field>
              <Button
                size='lg'
                type='submit'
                variant='outline'
                className=' bg-transparent over:bg-transparent border-blue-500/50'
                disabled={
                  !form.formState.isValid || form.formState.isSubmitting
                }
              >
                {form.formState.isSubmitting ? 'Logging in...' : 'Login '}
              </Button>
            </Field>
            <FieldSeparator className='bg-transparent'>Or</FieldSeparator>
            <Field>
              <Button
                variant='outline'
                type='button'
                className='w-full bg-gray-600/50 hover:bg-gray-600/50 border-0 text-gray-100'
                asChild
              >
                <Link
                  href='/dashboard'
                  className='w-full flex justify-center items-center gap-2'
                >
                  <HomeIcon />
                  Go Back
                </Link>
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </Form>
    </div>
  );
}
