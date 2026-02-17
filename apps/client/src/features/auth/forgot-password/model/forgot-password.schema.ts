import { z } from 'zod'

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  otp: z.string().min(6, { message: 'OTP must be 6 digits' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' }),
})

export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>
