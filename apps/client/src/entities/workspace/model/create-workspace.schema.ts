import z from 'zod'
import { CompanySize, CompanyType } from './workspace.types'

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name is required').trim(),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Only lowercase letters, numbers, and hyphens allowed (cannot start/end with hyphen)'
    )
    .trim(),
  companyType: z.enum(CompanyType, { error: 'Please select a company type' }),
  companySize: z.enum(CompanySize, { error: 'Please select a company size' }),
})

export type CreateWorkspaceData = z.infer<typeof createWorkspaceSchema>
