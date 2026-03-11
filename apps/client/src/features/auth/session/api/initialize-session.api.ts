import { privateAxios } from '@/shared/lib/axios'
import { API_ROUTES } from '@/shared/api/api.routes'
import { refreshTokenApi } from '../../refresh-token/api/refresh-token.api'
import { useUserStore } from '@/entities/user/model/user.store'
import type { ApiResponse } from '@/shared/api/api.types'
import type { User } from '@/entities/user/model/user.types'
import type { Organization } from '@/entities/organization/model/organization.types'

// 1. Define the exact shape of the 'data' object returned by your backend
interface UserPayload {
  user: User
}

interface OrganizationPayload {
  organization: Organization
}

export interface SessionData {
  user: User
  organization: Organization
}

export async function initializeSessionApi(): Promise<SessionData> {
  // 1. Explicitly fetch the access token using the HTTP-only cookie
  const accessToken = await refreshTokenApi()

  // 2. Synchronously update the Zustand store so privateAxios can use it
  useUserStore.getState().setAccessToken(accessToken)

  // 3. Fetch the User and Organization concurrently, passing the specific wrappers
  const [userRes, orgRes] = await Promise.all([
    privateAxios.get<ApiResponse<UserPayload>>(API_ROUTES.USERS.ME),
    privateAxios.get<ApiResponse<OrganizationPayload>>(
      API_ROUTES.ORGANIZATIONS.CURRENT
    ),
  ])

  if (!userRes.data.success || !orgRes.data.success)
    throw new Error('Something went wrong')

  // 4. Extract using the exact path: response -> generic data wrapper -> entity wrapper -> entity
  const user = userRes.data.data.user
  const organization = orgRes.data.data.organization

  // 5. Safety check
  if (!user || !organization) {
    throw new Error('Incomplete session data returned from server.')
  }

  return { user, organization }
}
