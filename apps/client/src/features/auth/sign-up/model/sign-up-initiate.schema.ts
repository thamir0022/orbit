import { z } from 'zod'

export const signUpInitiateSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
})

export type EmailStepData = z.infer<typeof signUpInitiateSchema>
