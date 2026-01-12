import {
  type ExceptionFilter,
  Catch,
  type ArgumentsHost,
  HttpStatus,
} from '@nestjs/common'
import type { Response } from 'express'
import { DomainException } from '../../domain/exceptions/domain.exception'

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    const statusMap: Record<string, HttpStatus> = {
      EMAIL_ALREADY_EXISTS: HttpStatus.CONFLICT,
      INVALID_EMAIL: HttpStatus.BAD_REQUEST,
      INVALID_PASSWORD: HttpStatus.BAD_REQUEST,
      USER_NOT_FOUND: HttpStatus.NOT_FOUND,
    }

    const status = statusMap[exception.code] || HttpStatus.BAD_REQUEST

    response.status(status).json({
      success: false,
      error: {
        code: exception.code,
        message: exception.message,
        timestamp: new Date().toISOString(),
      },
    })
  }
}
