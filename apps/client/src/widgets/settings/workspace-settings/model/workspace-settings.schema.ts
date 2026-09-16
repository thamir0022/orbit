import { CompanySize, CompanyType } from '@/entities/workspace'
import * as z from 'zod'

export const workspaceSettingsSchema = z.object({
  name: z.string().trim().min(1, 'Workspace name is required').max(100),

  slug: z
    .string()
    .trim()
    .min(1, 'Workspace slug is required')
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Use lowercase letters, numbers, and hyphens'
    ),

  companyType: z.enum(CompanyType).optional(),

  companySize: z.enum(CompanySize).optional(),

  defaultPointsPerMemberPerDay: z.number().min(0),

  defaultHoursPerDay: z.number().min(0).max(24),

  defaultWorkingDaysPerWeek: z.number().int().min(1).max(7),

  defaultWorkingDaysPerSprint: z.number().int().min(1),
})

export type WorkspaceSettingsFormValues = z.infer<
  typeof workspaceSettingsSchema
>
