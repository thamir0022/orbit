import { httpClient } from '@/shared/api/config/http-client'
import type { SignInFormData } from '../model/sign-in.schema'
import { API_ROUTES } from '@/shared/api/routes/api.routes'
import { WorkspaceListItem } from '@/entities/workspace'

interface SignInResponse {
  workspaces: WorkspaceListItem[]
}

export async function signInApi(data: SignInFormData) {
  const res = await httpClient.post<SignInResponse>(
    API_ROUTES.AUTH.SIGN_IN,
    data,
    { skipAuthHandling: true }
  )

  return res
}
