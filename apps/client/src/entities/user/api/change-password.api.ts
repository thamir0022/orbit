import { API_ROUTES } from '@/shared/api/api.routes'
import { httpClient } from '@/shared/lib/http/http-client'
import { User } from '../model/user.types'

export interface ChangePasswordApiPayload {
  currentPassword?: string
  newPassword: string
}

interface ChangePasswordApiRespone {
  user: User
}

export const changePasswordApi = async (payload: ChangePasswordApiPayload) => {
  const res = await httpClient.patch<ChangePasswordApiRespone>(
    API_ROUTES.AUTH.CHANGE_PASSWORD,
    payload
  )

  return res
}
