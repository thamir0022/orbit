import { z } from 'zod'

export const workspaceRoleFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Role name is required')
    .max(100, 'Role name is too long'),
  description: z.string().trim().max(500, 'Description is too long'),
  permissionIds: z.array(
    z.uuid({ version: 'v7', error: 'Invalid permission' })
  ),
})

export type WorkspaceRoleFormValues = z.infer<typeof workspaceRoleFormSchema>
