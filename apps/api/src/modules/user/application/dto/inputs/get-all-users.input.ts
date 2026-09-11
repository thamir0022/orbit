import { UserStatus } from '@/modules/user/domain'

export interface GetAllUsersInput {
  readonly page: number
  readonly limit: number
  readonly search?: string
  readonly status?: UserStatus
}
