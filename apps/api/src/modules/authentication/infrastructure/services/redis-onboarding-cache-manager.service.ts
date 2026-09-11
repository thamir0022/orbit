import { Inject, Injectable } from '@nestjs/common'
import { type Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import {
  type IOnboardingCache,
  OnboardingPayload,
  type OnboardingState,
  SignUpStep,
} from '../../application'
import {
  REDIS_CONFIG,
  type IRedisConfig,
} from '@/shared/infrastructure/interfaces/redis.config.interface'

@Injectable()
export class RedisOnboardingCache implements IOnboardingCache {
  private static readonly ONBOARDING_PREFIX = 'onboarding-flow:'

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
    @Inject(REDIS_CONFIG)
    private readonly config: IRedisConfig
  ) {}

  async initializeFlow({
    registrationToken,
    email,
  }: OnboardingPayload): Promise<void> {
    const existingState = await this.getFlowState(registrationToken)

    if (existingState)
      throw new Error('Onboarding flow already initialized for this token')

    const initialState: OnboardingState = {
      email: email.value,
      isEmailVerified: true,
      currentStep: SignUpStep.EMAIL_VERIFIED,
    }

    const ttl = this.config.signUpSessionTTL
    await this.cache.set(
      this.onboardingKey(registrationToken),
      initialState,
      ttl
    )
  }

  async getFlowState(
    registrationToken: string
  ): Promise<OnboardingState | null> {
    const state = await this.cache.get<OnboardingState>(
      this.onboardingKey(registrationToken)
    )
    return state ?? null
  }

  async updateFlowState(
    registrationToken: string,
    updates: Partial<OnboardingState>
  ): Promise<void> {
    const existingState = await this.getFlowState(registrationToken)

    if (!existingState) {
      throw new Error('Onboarding flow expired or invalid')
    }

    const updatedState: OnboardingState = {
      ...existingState,
      ...updates,
      // Security measure: Ensure core initialization data cannot be overwritten
      email: existingState.email,
    }

    const ttl = this.config.signUpSessionTTL
    await this.cache.set(
      this.onboardingKey(registrationToken),
      updatedState,
      ttl
    )
  }

  async completeFlow(registrationToken: string): Promise<void> {
    await this.cache.del(this.onboardingKey(registrationToken))
  }

  private onboardingKey(token: string): string {
    return `${RedisOnboardingCache.ONBOARDING_PREFIX}${token}`
  }
}
