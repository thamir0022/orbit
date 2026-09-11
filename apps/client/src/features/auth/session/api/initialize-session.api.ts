import { apiClient } from '@/shared/lib/axios'
import { API_ROUTES } from '@/shared/api/api.routes'
import { refreshTokenApi } from '../../refresh-token/api/refresh-token.api'
import { useUserStore } from '@/entities/user/model/user.store'
import type { ApiResponse } from '@/shared/api/api.types'
import type { User } from '@/entities/user/model/user.types'
import type { Workspace } from '@/entities/workspace/model/workspace.types'

// 1. Define the exact shape of the 'data' object returned by your backend
interface UserPayload {
  user: User
}

interface WorkspacePayload {
  workspace: Workspace
}

export interface SessionData {
  user: User
  workspace: Workspace
}

export async function initializeSessionApi(): Promise<SessionData> {
  // 1. Explicitly fetch the access token using the HTTP-only cookie
  const accessToken = await refreshTokenApi()

  // 2. Synchronously update the Zustand store so apiClient can use it
  useUserStore.getState().setAccessToken(accessToken)

  // 3. Fetch the User and Workspace concurrently, passing the specific wrappers
  const [userRes, orgRes] = await Promise.all([
    apiClient.get<ApiResponse<UserPayload>>(API_ROUTES.USERS.ME),
    apiClient.get<ApiResponse<WorkspacePayload>>(API_ROUTES.WORKSPACES.CURRENT),
  ])

  if (!userRes.data.success || !orgRes.data.success)
    throw new Error('Something went wrong')

  // 4. Extract using the exact path: response -> generic data wrapper -> entity wrapper -> entity
  const user = userRes.data.data.user
  const workspace = orgRes.data.data.workspace

  // 5. Safety check
  if (!user || !workspace) {
    throw new Error('Incomplete session data returned from server.')
  }

  return { user, workspace }
}
