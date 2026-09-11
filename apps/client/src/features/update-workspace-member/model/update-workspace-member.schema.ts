import { z } from 'zod'
import { workspaceMemberStatusOptions } from './status-options'

const workspaceMemberStatusValues = workspaceMemberStatusOptions.map(
  (option) => option.value
) as [string, ...string[]]

export const updateWorkspaceMemberSchema = z.object({
  roleId: z.string().min(1, 'Role is required'),
  status: z.enum(workspaceMemberStatusValues as [string, ...string[]]),
})

export type UpdateWorkspaceMemberFormValues = z.infer<
  typeof updateWorkspaceMemberSchema
>
export type WorkspaceMemberStatus = UpdateWorkspaceMemberFormValues['status']
