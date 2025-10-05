import { z } from 'zod';

const createAccountFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: 'Name must be at least 2 characters.',
    })
    .regex(/^\s*\S+\s+\S+.*$/, {
      message: 'Please enter your full name (first and last).',
    }),

  email: z.email().min(2, {
    message: 'email must be at least 2 characters.',
  }),

  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters.' })
    .regex(/[A-Z]/, {
      message: 'Password must contain at least one uppercase letter.',
    })
    .regex(/[0-9]/, {
      message: 'Password must contain at least one number.',
    })
    .regex(/[^a-zA-Z0-9]/, {
      message: 'Password must contain at least one special character.',
    }),
});

export type CreateAccountFormValues = z.infer<typeof createAccountFormSchema>;

export default createAccountFormSchema;
