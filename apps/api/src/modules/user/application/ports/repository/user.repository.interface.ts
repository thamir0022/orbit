import { User, Email, UserId } from '@/modules/user/domain'

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

export interface IUserRepository {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  existsByEmail(email: Email): Promise<boolean>;
  save(user: User): Promise<User>;
  delete(id: UserId): Promise<void>;
}

export const USER_REPOSITORY = Symbol('IUserRepository')
