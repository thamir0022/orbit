/**
 * Application-level event publisher contract.
 *
 * - Decouples producing modules from event infrastructure.
 * - Publishes facts after successful business operations.
 * - Does not guarantee durable delivery or retries.
 */
export interface ApplicationEventPublisher {
  publish<T extends object>(eventName: string, payload: T): void
}

/** Injection token for the application event publisher. */
export const APPLICATION_EVENT_PUBLISHER = Symbol('ApplicationEventPublisher')
