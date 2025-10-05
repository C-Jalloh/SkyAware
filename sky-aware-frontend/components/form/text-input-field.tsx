'use client';
import React, { type FC } from 'react';

import { Eye, EyeOff } from 'lucide-react';

import type { InputProps } from '@/types/input';

import { Button } from '../ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';

const TextInputField: FC<InputProps> = ({
  name,
  control,
  label,
  labelColor = '#444',
  prefixIcon: Icon,
  placeholder,
  type,
  onChange,
  secureEntry,
  isPasswordVisible,
  togglePassword,
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className='w-full'>
          <FormLabel style={{ color: labelColor }}>{label}</FormLabel>
          <div className='flex flex-row justify-start bg-transparent items-center border border-blue-500/50 rounded-md w-full mb-2'>
            {Icon && <Icon size={24} className=' text-gray-300 mx-2' />}
            <FormControl>
              <input
                {...field}
                className={`w-full bg-transparent text-gray-400 pr-2 placeholder:text-500-500/50 py-[6px] border-none outline-none pl-1 focus:shadow-[0 0 5px rgba(0, 123, 255, 0.5)] placeholder:text-[13px] ${secureEntry ? 'rounded-r-0' : 'rounded-r-md'}`} // Adjusted placeholder size
                placeholder={placeholder}
                type={isPasswordVisible ? 'text' : type}
                onChange={e => {
                  field.onChange(e);
                  if (onChange) {
                    onChange(e);
                  }
                }}
              />
            </FormControl>
            {secureEntry && (
              <Button
                type='button'
                variant='default'
                className='w-5 h-5 bg-transparent hover:bg-transparent mr-2 px-1 shadow-none'
                onClick={togglePassword}
              >
                {isPasswordVisible ? (
                  <EyeOff size={22} className='text-gray-500' />
                ) : (
                  <Eye size={22} className='text-gray-500' />
                )}
              </Button>
            )}
          </div>
          {fieldState.error && <FormMessage className='text-red-500' />}
        </FormItem>
      )}
    />
  );
};

export default TextInputField;
