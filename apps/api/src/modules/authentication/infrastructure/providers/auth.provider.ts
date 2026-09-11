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
]
