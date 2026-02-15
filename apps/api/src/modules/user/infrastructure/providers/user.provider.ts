import { Provider } from '@nestjs/common'
import { USER_REPOSITORY } from '../../application'
import { SESSION_MANAGER, TOKEN_GENERATOR } from '@/modules/auth/application'
import { UserRepository } from '../persistence/repository/user.repository'
import { JwtTokenGenerator } from '@/modules/auth/infrastructure/services/jwt-token-generator.service'
import { RedisSessionManager } from '@/modules/auth/infrastructure/services/redis-session-manager.service'

export const userProviders: Provider[] = [
  {
    provide: USER_REPOSITORY,
    useClass: UserRepository,
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
