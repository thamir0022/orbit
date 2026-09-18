import { API_ROUTES } from '@/shared/api/api.routes'
import { httpClient } from '@/shared/lib/http/http-client'

export interface ChangePasswordApiPayload {
  currentPassword?: string
  newPassword: string
}

export const changePasswordApi = async (payload: ChangePasswordApiPayload) => {
  const res = await httpClient.patch(API_ROUTES.AUTH.CHANGE_PASSWORD, payload)

  return res
}
