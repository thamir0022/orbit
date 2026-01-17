import type { Provider } from '@nestjs/common'
import { USER_REPOSITORY } from '../../../user/application/ports/repository/user.repository.interface'
import { PASSWORD_HASHER } from '../../application/ports/services/password-hasher.interface'
import { TOKEN_GENERATOR } from '../../application/ports/services/token-generator.interface'
import { SESSION_MANAGER } from '../../application/ports/services/session-manager.interface'
import { UserRepository } from '../../../user/infrastructure/persistence/repository/user.repository'
import { BcryptPasswordHasher } from '../services/bcrypt-password-hasher.service'
import { JwtTokenGenerator } from '../services/jwt-token-generator.service'
import { RedisSessionManager } from '../services/redis-session-manager.service'

/**
 * User Module Providers
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
]
