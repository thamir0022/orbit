import brcypt from 'bcryptjs'
import { type IPasswordHasher } from '../../application'
import { Injectable } from '@nestjs/common'

/**
 * Bcrypt Password Hasher Implementation (Adapter)
 *
 * INFRASTRUCTURE LAYER - Implements the IPasswordHasher port
 *
 * This adapter encapsulates the bcrypt library details.
 * Could be swapped with Argon2 without changing Application layer.
 */

@Injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
  private readonly SALT_ROUNDS = 12

  async hash(plainPassword: string): Promise<string> {
    return brcypt.hash(plainPassword, this.SALT_ROUNDS)
  }

  async compare(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return brcypt.compare(plainPassword, hashedPassword)
  }
}
