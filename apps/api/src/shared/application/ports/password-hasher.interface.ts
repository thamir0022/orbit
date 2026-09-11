import { Password } from '@/modules/user/domain'

/**
 * Password Hasher Interface (Port)
 *
 * This is an APPLICATION LAYER port that defines the contract
 * for password hashing operations. Infrastructure layer provides
 * the concrete implementation (e.g., BcryptPasswordHasher).
 *
 * Why here and not in Domain?
 * - Password hashing is an infrastructure/security concern
 * - The actual algorithm (bcrypt, argon2) is implementation detail
 * - Domain only cares about the Password value object
 */

export interface IPasswordHasher {
  hash(plainPassword: Password): Promise<string>
  compare(plainPassword: string, hashedPassword: string): Promise<boolean>
}

export const PASSWORD_HASHER = Symbol('IPasswordHasher')
