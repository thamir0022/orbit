import { User } from '@/entities/user/model/user.types'
import type { ApiResponse } from '@/shared/api/api.types'

export interface SignInData {
  user: User
  tokens: {
    accessToken: string
  }
}

export type SignInResponse = ApiResponse<SignInData>
