import { z } from 'zod'

export const emailSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
})

export type emailFormData = z.infer<typeof emailSchema>
