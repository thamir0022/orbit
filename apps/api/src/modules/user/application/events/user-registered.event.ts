/** Event name published when a new user account is persisted. */
export const USER_REGISTERED_EVENT = 'user.registered' as const

/**
 * Application event representing a successfully registered user.
 *
 * - Published only after the user has been persisted.
 * - Contains stable identity without exposing personal information.
 * - The user ID also serves as the welcome notification's idempotency key.
 */
export interface UserRegisteredEvent {
  readonly userId: string
}
