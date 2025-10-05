import { z } from 'zod';

const loginFormSchema = z.object({
  email: z.email().min(2, {
    message: 'email must be at least 2 characters.',
  }),

  password: z.string().min(7, {
    message: 'Password must be at least 6 characters.',
  }),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export default loginFormSchema;
