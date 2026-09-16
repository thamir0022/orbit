import * as z from 'zod'

export const generalSettingsSchema = z.object({
  language: z.string().min(1),
  timezone: z.string().min(1),
  dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']),
  timeFormat: z.enum(['12-hour', '24-hour']),
})

export type GeneralSettingsFormValues = z.infer<
  typeof generalSettingsSchema
>