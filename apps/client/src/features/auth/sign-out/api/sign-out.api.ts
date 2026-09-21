import { httpClient } from '@/shared/api/config/http-client'
import { API_ROUTES } from '@/shared/api/routes/api.routes'

export async function signOutApi() {
  const res = await httpClient.post(API_ROUTES.AUTH.SIGN_OUT)
  return res
}
