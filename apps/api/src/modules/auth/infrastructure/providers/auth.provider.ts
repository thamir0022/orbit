import { Provider } from '@nestjs/common'
import { USER_REPOSITORY } from '@/modules/user/application'
import { UserRepository } from '@/modules/user/infrastructure/persistence/repository/user.repository'
import { BcryptPasswordHasher } from '../services/bcrypt-password-hasher.service'
import { JwtTokenGenerator } from '../services/jwt-token-generator.service'
import { RedisSessionManager } from '../services/redis-session-manager.service'
import {
  PASSWORD_HASHER,
  SESSION_MANAGER,
  TOKEN_GENERATOR,
} from '../../application'
import { OTP_MANAGER } from '../../application/repositories/otp-manager.interface'
import { RedisOtpManager } from '../services/redis-otp-manager.service'

/**
 * Auth Module Providers
 *
 * INFRASTRUCTURE LAYER - Dependency Injection Configuration
 *
 * This is where we bind Ports (interfaces) to Adapters (implementations).
 * This follows the Dependency Inversion Principle:
 * - High-level modules (Application) depend on abstractions (Ports)
 * - Low-level modules (Infrastructure) implement those abstractions (Adapters)
 */

export const authProviders: Provider[] = [
  {
    provide: USER_REPOSITORY,
    useClass: UserRepository,
  },
  {
    provide: PASSWORD_HASHER,
    useClass: BcryptPasswordHasher,
  },
  {
    provide: TOKEN_GENERATOR,
    useClass: JwtTokenGenerator,
  },
  {
    provide: SESSION_MANAGER,
    useClass: RedisSessionManager,
  },
  {
    provide: OTP_MANAGER,
    useClass: RedisOtpManager,
  },
]
