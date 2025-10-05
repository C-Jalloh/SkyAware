'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup } from '@/components/ui/field';
import { cn } from '@/lib/utils';
import changePasswordSchema, {
  type ChangePasswordFormValues,
} from '@/utils/schemas/change-password-schema';

import TextInputField from './form/text-input-field';

/*
import TextInputField from '';
import Logo from './logo';
import { Form } from './ui/form';
*/
export function ChangePasswordForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // 2. Define a submit handler.
  function onSubmit(values: ChangePasswordFormValues) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <FieldGroup>
            <div className='flex flex-col items-center gap-2'>
              <FieldDescription className='font-medium text-md'>
                Change Password
              </FieldDescription>
            </div>
            <Field>
              <TextInputField
                prefixIcon={Lock}
                label='Old Password'
                name='oldPassword'
                placeholder='Enter old password'
                type='password'
                togglePassword={togglePasswordVisibility}
                secureEntry
                isPasswordVisible={showPassword}
              />

              <TextInputField
                prefixIcon={Lock}
                label='New Password'
                name='newPassword'
                placeholder='Enter new password'
                type='password'
                togglePassword={toggleNewPasswordVisibility}
                secureEntry
                isPasswordVisible={showNewPassword}
              />

              <TextInputField
                prefixIcon={Lock}
                label='Confirm Password'
                name='confirmPassword'
                placeholder='Enter confirm password'
                type='password'
                togglePassword={toggleConfirmPasswordVisibility}
                secureEntry
                isPasswordVisible={showConfirmPassword}
              />
            </Field>
            <Field>
              <Button
                size='lg'
                type='submit'
                variant='outline'
                className=' bg-transparent over:bg-transparent border-blue-500/50'
              >
                Change Password
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </form>
    </div>
  );
}
