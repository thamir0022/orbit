import { httpClient } from '@/shared/lib/http/http-client'
import { API_ROUTES } from '@/shared/api/api.routes'

export async function signOutApi() {
  const response = await httpClient.post(API_ROUTES.AUTH.SIGN_OUT)
  return response.data
}
