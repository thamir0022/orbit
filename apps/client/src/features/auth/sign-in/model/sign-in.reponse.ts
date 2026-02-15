import { User } from '@/entities/user/model/user.types'

export interface SignInData {
  user: User
  tokens: {
    accessToken: string
  }
}
