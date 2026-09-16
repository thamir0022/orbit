import * as z from 'zod'

export const profileSettingsSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(50, 'First name is too long'),

  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(50, 'Last name is too long'),

  displayName: z
    .string()
    .trim()
    .min(1, 'Display name is required')
    .max(100, 'Display name is too long'),
})

export type ProfileSettingsFormValues = z.infer<typeof profileSettingsSchema>
