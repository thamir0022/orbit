import { API_ROUTES } from '@/shared/api/routes/api.routes'
import { httpClient } from '@/shared/api/config/http-client' 
import { User } from '../model/user.types'

export type UpdateProfilePayload = {
  firstName: string
  lastName: string
  displayName: string
}

type UpdateProfileResponse = {
  user: User
}

export const updateProfile = async (payload: UpdateProfilePayload) => {
  const res = await httpClient.put<UpdateProfileResponse>(
    API_ROUTES.USERS.UPDATE_PROFILE,
    payload
  )

  return res
}
