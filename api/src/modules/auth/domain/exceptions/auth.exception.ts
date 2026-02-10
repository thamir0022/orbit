import { DomainException } from '@/shared/domain'
import { HttpStatus } from '@nestjs/common'

export class InvalidRefreshTokenException extends DomainException {
  readonly httpStatusCode = HttpStatus.UNAUTHORIZED

  constructor() {
    super('INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired')
  }
}

export class SessionNotFoundException extends DomainException {
  readonly httpStatusCode = HttpStatus.UNAUTHORIZED

  constructor(sessionId: string) {
    super('SESSION_NOT_FOUND', `Session ${sessionId} not found or expired`)
  }
}

export class RefreshTokenMismatchException extends DomainException {
  readonly httpStatusCode = HttpStatus.UNAUTHORIZED

  constructor() {
    super('REFRESH_TOKEN_MISMATCH', 'Invalid refresh token')
  }
}
