import { z } from 'zod'

export const signUpDetailsSchema = z
  .object({
    firstName: z
      .string()
      .min(2, 'First name must be at least 2 characters')
      .trim(),
    lastName: z
      .string()
      .min(2, 'Last name must be at least 2 characters')
      .trim(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .trim(),
    confirmPassword: z.string().trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type ProfileStepData = z.infer<typeof signUpDetailsSchema>
