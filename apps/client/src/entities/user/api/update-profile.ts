import { API_ROUTES } from '@/shared/api/api.routes'
import { httpClient } from '@/shared/lib/http/http-client'
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
  const { data } = await httpClient.put<UpdateProfileResponse>(
    API_ROUTES.USERS.UPDATE_PROFILE,
    payload
  )

  return data.user
}
