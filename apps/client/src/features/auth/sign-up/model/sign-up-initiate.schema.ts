import { z } from 'zod'

export const signUpInitiateSchema = z.object({
  email: z.email('Invalid email address').trim().lowercase(),
})

export type EmailStepData = z.infer<typeof signUpInitiateSchema>
