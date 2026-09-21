import { httpClient } from '@/shared/api/config/http-client'
import type { GetCurrentUserData, User } from '../model/user.types'
import { API_ROUTES } from '@/shared/api/routes/api.routes'

export async function getCurrentUserApi(): Promise<User> {
  const response = await httpClient.get<GetCurrentUserData>(API_ROUTES.USERS.ME)
  return response.data.user
}
