/* eslint-disable no-alert */
'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { HomeIcon, Lock, Mail, User2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from '@/components/ui/field';
import { cn } from '@/lib/utils';
import { createAccountService } from '@/services/user';
import createAccountFormSchema, {
  type CreateAccountFormValues,
} from '@/utils/schemas/create-account-schema';

import TextInputField from './form/text-input-field';
import Logo from './logo';
import { Form } from './ui/form';

export function CreateAccountForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // 2. Define a submit handler.
  const onSubmit = async (values: CreateAccountFormValues) => {
    try {
      const res = await createAccountService(values);
      const data = await res;

      if (res.success) {
        router.push('/login');
      } else {
        alert(`Error creating account: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating account:', error);
      alert(
        `Error creating account: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  };

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
                Already have an account? <Link href='/login'>Sign In</Link>
              </FieldDescription>
            </div>
            <Field>
              <TextInputField
                prefixIcon={User2}
                label='Full Name'
                name='name'
                placeholder='Enter full name'
                type='text'
              />

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
                {form.formState.isSubmitting
                  ? 'Creating Account...'
                  : 'Create Account '}
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
