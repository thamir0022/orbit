import type { WorkspaceMember } from '@/entities/workspace-member'
import type { UpdateWorkspaceMemberFormValues } from '../model/update-workspace-member.schema'
import { httpClient } from '@/shared/api/config/http-client'
import { API_ROUTES } from '@/shared/api/routes/api.routes'

export async function updateWorkspaceMember(
  memberId: string,
  payload: UpdateWorkspaceMemberFormValues
): Promise<WorkspaceMember> {
  const { data } = await httpClient.patch<WorkspaceMember>(
    API_ROUTES.WORKSPACES.MEMBERS.UPDATE(memberId),
    payload
  )

  return data
}
