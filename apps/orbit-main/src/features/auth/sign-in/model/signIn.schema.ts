import { z } from 'zod'

export const signInSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be alteast 8 characters' })
    .max(32, { message: 'Password must be atmost 32 characters' }),
})

export type SignInFormData = z.infer<typeof signInSchema>
