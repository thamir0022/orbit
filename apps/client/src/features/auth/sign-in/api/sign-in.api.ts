import { axiosInstance } from '@/shared/lib/axios.instance'
import type { SignInFormData } from '../model/sign-in.schema'
import type { SignInResponse } from './types'
import { API_ROUTES } from '@/shared/api/api.routes'

export async function signInApi(data: SignInFormData): Promise<SignInResponse> {
  const response = await axiosInstance.post<SignInResponse>(
    API_ROUTES.AUTH.SIGN_IN,
    data
  )
  return response.data
}
