import type { Provider } from '@nestjs/common'
import { USER_REPOSITORY } from '@/modules/user/application'
import { PASSWORD_HASHER } from '@/modules/user/application'
import { TOKEN_GENERATOR } from '@/modules/user/application'
import { SESSION_MANAGER } from '@/modules/user/application'
import { UserRepository } from '@/modules/user/infrastructure'
import { BcryptPasswordHasher } from '@/modules/user/infrastructure/services/bcrypt-password-hasher.service'
import { JwtTokenGenerator } from '@/modules/user/infrastructure/services/jwt-token-generator.service'
import { RedisSessionManager } from '@/modules/user/infrastructure/services/redis-session-manager.service'

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
export const userProviders: Provider[] = [
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
