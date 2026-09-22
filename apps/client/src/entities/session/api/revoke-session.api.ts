import { httpClient } from '@/shared/api/config/http-client'
import { API_ROUTES } from '@/shared/api/routes/api.routes'

export const revokeSessionApi = async (publicId: string) => {
  const res = await httpClient.delete(API_ROUTES.AUTH.SESSIONS.REVOKE(publicId))
  return res
}
