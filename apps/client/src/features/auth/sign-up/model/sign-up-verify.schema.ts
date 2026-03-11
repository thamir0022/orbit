import { z } from 'zod'

export const signUpVerifySchema = z.object({
  code: z
    .string()
    .length(6, 'Verification code must be exactly 6 digits')
    .regex(/^\d+$/, 'Code must contain only numbers'),
})

export type OtpStepData = z.infer<typeof signUpVerifySchema>
