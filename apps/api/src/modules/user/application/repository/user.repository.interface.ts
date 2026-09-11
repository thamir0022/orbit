import { User, Email, UserId, UserStatus } from '@/modules/user/domain'
import { IBaseRepository } from '@/shared/application'
import { PaginatedResult } from '@/shared/application/repository/paginated-result'

/**
 * User Repository Interface (Port)
 *
 * This is an APPLICATION LAYER port that defines the contract
 * for user persistence operations. The infrastructure layer
 * provides the concrete implementation (Adapter).
 *
 * Why here and not in Domain?
 * - Repositories are persistence concerns, not business rules
 * - The Domain layer should be completely ignorant of persistence
 * - Application layer orchestrates use cases and defines what it needs
 */

export type FindUsersQuery = {
  readonly page: number
  readonly limit: number
  readonly search?: string
  readonly status?: UserStatus
}

export interface IUserRepository extends IBaseRepository<User, UserId> {
  findAll(options: FindUsersQuery): Promise<PaginatedResult<User[] | []>>
  findByEmail(email: Email): Promise<User | null>
  existsByEmail(email: Email): Promise<boolean>
}

export const USER_REPOSITORY = Symbol('IUserRepository')
