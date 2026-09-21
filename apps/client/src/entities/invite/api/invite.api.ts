import { httpClient } from '@/shared/api/config/http-client'
import {
  CreateWorkspaceInvitationInput,
  CreateWorkspaceInvitationResponse,
} from '../model/types'
import { API_ROUTES } from '@/shared/api/routes/api.routes'

export async function createWorkspaceInvitation(
  payload: CreateWorkspaceInvitationInput
) {
  return await httpClient.post<CreateWorkspaceInvitationResponse>(
    API_ROUTES.WORKSPACES.CREATE_INVITATION,
    payload
  )
}

// export async function getWorkspaceInvitations(
//   workspaceId: string
// ): Promise<WorkspaceInvitation[]> {
//   const {data} = await httpClient.get(API_ROUTES.WORKSPACES.GET_ALL_INVITATION)

//   return data.
// }
