'use client';

import React, { type FC, type ReactNode } from 'react';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { Control, FieldValues } from 'react-hook-form';

type SelectInputProps = {
  name: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  // defaultValue?: string;
  control?: Control<FieldValues | any>;
  children: ReactNode;
};

const SelectInput: FC<SelectInputProps> = ({
  name,
  control,
  placeholder = 'Select an option',
  label,
  disabled = false,
  children,
  ...props
}) => {
  return (
    <FormField
      control={control}
      name={name}
      disabled={disabled}
      render={({ field, fieldState }) => (
        <FormItem className=' w-full border-gray-800 shadow-none'>
          <FormLabel className='text-gray-800'>{label}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl {...props}>
              <SelectTrigger>
                <SelectValue
                  placeholder={placeholder}
                  className='text-gray-800 placeholder:text-gray-800'
                />
              </SelectTrigger>
            </FormControl>
            <SelectContent className='shadow-none text-gray-600'>
              {children}
            </SelectContent>
          </Select>

          {fieldState.error && <FormMessage />}
        </FormItem>
      )}
    />
  );
};

export default SelectInput;
