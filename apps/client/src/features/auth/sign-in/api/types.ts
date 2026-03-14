import type { ApiResponse } from '@/shared/api/api.types'

export interface SignInData {
  redirectUrl: string
}

export type SignInResponse = ApiResponse<SignInData>
