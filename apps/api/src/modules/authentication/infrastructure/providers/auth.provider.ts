import { Provider } from '@nestjs/common'
import { RedisSessionManager } from '../services/redis-session-manager.service'
import {
  OAUTH_FACTORY,
  SESSION_MANAGER,
  ONBOARDING_CACHE,
} from '../../application'
import { OTP_MANAGER } from '../../application/ports/otp-manager.interface'
import { RedisOtpManager } from '../services/redis-otp-manager.service'
import { OAuthFactory } from '../factory/oauth.factory'
import { RedisOnboardingCache } from '../services/redis-onboarding-cache-manager.service'
import { AuthService } from '../../application/services/auth.service'
import { UserAgentParserService } from '../services/user-agent-parser.service'
import { AUTH_SERVICE } from '../../application/services/auth.service.interface'
import { USER_AGENT_PARSER } from '../../application/ports/user-agent-parser.interface'
import { APP_GUARD } from '@nestjs/core'
import { AccessTokenGuard } from '../../presentation/guards'

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
    provide: SESSION_MANAGER,
    useClass: RedisSessionManager,
  },
  {
    provide: ONBOARDING_CACHE,
    useClass: RedisOnboardingCache,
  },
  {
    provide: OTP_MANAGER,
    useClass: RedisOtpManager,
  },
  {
    provide: OAUTH_FACTORY,
    useClass: OAuthFactory,
  },
  {
    provide: AUTH_SERVICE,
    useClass: AuthService,
  },
  {
    provide: USER_AGENT_PARSER,
    useClass: UserAgentParserService,
  },
  {
    provide: APP_GUARD,
    useClass: AccessTokenGuard,
  },
]
