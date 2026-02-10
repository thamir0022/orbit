import { DomainException } from '@/shared/domain'
import { HttpStatus } from '@nestjs/common'

export class InvalidRefreshTokenException extends DomainException {
  constructor() {
    super({
      code: 'INVALID_REFRESH_TOKEN',
      message: 'Refresh token is invalid or expired',
      statusCode: HttpStatus.UNAUTHORIZED,
    })
  }
}

export class SessionNotFoundException extends DomainException {
  constructor(sessionId: string) {
    super({
      code: 'SESSION_NOT_FOUND',
      message: `Session ${sessionId} not found or expired`,
      statusCode: HttpStatus.UNAUTHORIZED,
    })
  }
}

export class RefreshTokenMismatchException extends DomainException {
  constructor() {
    super({
      code: 'REFRESH_TOKEN_MISMATCH',
      message: 'Invalid refresh token',
      statusCode: HttpStatus.UNAUTHORIZED,
    })
  }
}
