import { z } from 'zod'

export const CreateTeamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Team name is required')
    .max(100, 'Team name must be 100 characters or less'),

  description: z
    .string()
    .trim()
    .max(500, 'Description must be 500 characters or less')
    .optional(),

  memberIds: z.array(z.uuid()),

  leadId: z.uuid().optional(),
})

export type CreateTeamFormValues = z.infer<typeof CreateTeamSchema>
