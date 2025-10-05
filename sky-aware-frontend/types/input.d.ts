import type { ForwardRefExoticComponent, RefAttributes } from 'react';

import type { LucideProps } from 'lucide-react';
import type { Control } from 'react-hook-form';

declare interface InputProps {
  control?: Control<any>;
  label: string;
  type?: string;
  defaultValue?: string;
  name: string;
  prefixIcon?: ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
  >;
  placeholder?: string;
  labelColor?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement> | any) => void;
  secureEntry?: boolean;
  togglePassword?: () => void;
  isPasswordVisible?: boolean;
  value?: string;
  register?: any;
  required?: string;
  error?: any;
}
