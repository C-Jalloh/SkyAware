import { z } from 'zod';

export const changePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(6, { message: 'Old password must be at least 6 characters.' }),

    newPassword: z
      .string()
      .min(8, { message: 'New password must be at least 8 characters.' })
      .regex(/[A-Z]/, {
        message: 'New password must contain at least one uppercase letter.',
      })
      .regex(/[0-9]/, {
        message: 'New password must contain at least one number.',
      })
      .regex(/[^a-zA-Z0-9]/, {
        message: 'New password must contain at least one special character.',
      }),

    confirmPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export default changePasswordSchema;
