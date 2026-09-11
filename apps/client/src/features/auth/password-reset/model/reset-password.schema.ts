import { z } from 'zod'

export const resetPasswordSchema = z
  .object({
    email: z.string().email({ message: 'Please enter a valid email address' }),
    otp: z.string().min(6, { message: 'OTP must be 6 digits' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?{}[\]~]).{8,}$/, {
        message:
          'Password must be at least 8 characters long and include at least one uppercase letter, one number, and one special character.',
      }),
    confirmPassword: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type ResetPasswordData = z.infer<typeof resetPasswordSchema>
export type RequestResetPayload = Pick<ResetPasswordData, 'email'>
export type ResetPasswordResendOtpPayload = Pick<ResetPasswordData, 'email'>
export type VerifyOtpPayload = Required<
  Pick<ResetPasswordData, 'email' | 'otp'>
>
export type ConfirmResetPayload = {
  resetToken: string
  newPassword: z.infer<typeof resetPasswordSchema>['password']
}
