import { z } from 'zod'

export const inviteMemberSchema = z.object({
  email: z
    .email('Enter a valid email')
    .trim()
    .transform((value) => value.toLowerCase()),
  roleId: z.uuid({ version: 'v7', error: 'Invalid role' }),
})

export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>
