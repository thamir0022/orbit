import { TeamStatus } from '@/entities/team'
import { z } from 'zod'

export const UpdateTeamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Team name is required')
    .max(100, 'Team name must be 100 characters or less')
    .optional(),

  description: z
    .string()
    .trim()
    .max(500, 'Description must be 500 characters or less')
    .optional(),

  leadId: z.uuid('Invalid lead id').optional(),

  status: z.enum(TeamStatus, 'Invalid team status').optional(),
})

export type UpdateTeamFormValues = z.infer<typeof UpdateTeamSchema>
