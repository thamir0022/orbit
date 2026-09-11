import z from 'zod'

export const signUpSchema = z
  .object({
    firstName: z.string().min(2, 'First name is required').trim(),
    lastName: z.string().min(2, 'Last name is required').trim(),
    email: z.email().lowercase().trim(),
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

export type SignUpFormData = z.infer<typeof signUpSchema>
