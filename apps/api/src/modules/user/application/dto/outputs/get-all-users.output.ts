import { AuthenticatedUser } from '../../contracts/authenticated-user.interface'

export interface GetAllUsersOutput {
  users: AuthenticatedUser[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
