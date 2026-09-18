import { z } from 'zod'

export const changePasswordSchema = (hasPassword: boolean) =>
  z
    .object({
      currentPassword: hasPassword
        ? z.string().min(1, 'Current password is required')
        : z.string().optional(),

      newPassword: z
        .string()
        .trim()
        .min(8, 'Password must be at least 8 characters long')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/\d/, 'Password must contain at least one number')
        .regex(
          /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/,
          'Password must contain at least one special character'
        )
        .regex(/^\S+$/, 'Password cannot contain whitespace'),

      confirmPassword: z.string().min(1, 'Please confirm your new password'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    })

export type ChangePasswordData = z.infer<
  ReturnType<typeof changePasswordSchema>
>
