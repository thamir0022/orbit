import { DomainException } from '@/shared/domain'

/**
 * Domain-level validation failure in the Notification bounded context.
 *
 * - Uses Orbit's standard domain error envelope.
 */
export class NotificationValidationException extends DomainException {
  constructor(message: string) {
    super({ code: 'INVALID_NOTIFICATION', message })
  }
}
