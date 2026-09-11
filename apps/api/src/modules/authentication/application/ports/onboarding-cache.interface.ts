import { Email } from '@/modules/user/domain'

/**
 * Onboarding Cache Interface (Port)
 *
 * APPLICATION LAYER port for managing temporary state during multi-step registration.
 */

// Keep this enum in the domain/application layer where it belongs!
export enum SignUpStep {
  EMAIL_VERIFIED = 'email_verified',
  WORKSPACE_CREATED = 'workspace_created',
  DETAILS_COMPLETED = 'details_completed',
}

export interface OnboardingState {
  email: string
  isEmailVerified: boolean
  currentStep: SignUpStep
  firstName?: string
  lastName?: string
  passwordHash?: string
}

export interface OnboardingPayload {
  registrationToken: string
  email: Email
}

export interface IOnboardingCache {
  /**
   * Initializes a temporary onboarding flow (e.g., valid for 24 hours).
   */
  initializeFlow(payload: OnboardingPayload): Promise<void>

  getFlowState(registrationToken: string): Promise<OnboardingState | null>

  updateFlowState(
    registrationToken: string,
    updates: Partial<Omit<OnboardingState, 'email'>>
  ): Promise<void>

  /**
   * Clears the cache once the user successfully completes onboarding.
   */
  completeFlow(registrationToken: string): Promise<void>
}

export const ONBOARDING_CACHE = Symbol('IOnboardingCache')
