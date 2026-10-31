import { HttpStatus } from '@nestjs/common'
import { DomainException } from '@/shared/domain'

/**
 * Raised when an accessible notification cannot be found.
 *
 * Also represents expired or non-owned notifications.
 */
export class NotificationNotFoundException extends DomainException {
  constructor() {
    super({
      code: 'NOTIFICATION_NOT_FOUND',
      message: 'Notification not found',
      statusCode: HttpStatus.NOT_FOUND,
    })
  }
}
