import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import { DomainException } from '@/shared/domain/exceptions/domain.exception'
import { ApiResponseDto } from '../dtos/api-response.dto'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()

    const mapped = this.mapException(exception)

    const body: ApiResponseDto<null> = {
      success: false,
      statusCode: mapped.status,
      message: mapped.message,
      data: null,
      error: {
        code: mapped.code ?? this.defaultCode(mapped.status),
        message: mapped.message,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    }

    response.status(mapped.status).json(body)
  }

  private mapException(exception: unknown): {
    status: number
    message: string
    code?: string
  } {
    // Domain Exception
    if (exception instanceof DomainException) {
      return {
        status: exception.httpStatusCode ?? HttpStatus.BAD_REQUEST,
        message: exception.message,
        code: exception.code,
      }
    }

    // Http Exception (includes class-validator)
    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const response = exception.getResponse()

      if (typeof response === 'string') {
        return { status, message: response }
      }

      if (this.isHttpErrorResponse(response)) {
        const message = Array.isArray(response.message)
          ? response.message.join(', ')
          : response.message

        return {
          status,
          message: message ?? exception.message,
        }
      }

      return {
        status,
        message: exception.message,
      }
    }

    // Native Error
    if (exception instanceof Error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message || 'Internal server error',
      }
    }

    // Unknown thrown value
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Unexpected error',
    }
  }

  private isHttpErrorResponse(
    response: unknown
  ): response is { message?: string | string[] } {
    return (
      typeof response === 'object' && response !== null && 'message' in response
    )
  }

  private defaultCode(status: number): string {
    if (status >= 500) return 'INTERNAL_ERROR'
    if (status === 400) return 'BAD_REQUEST'
    if (status === 401) return 'UNAUTHORIZED'
    if (status === 403) return 'FORBIDDEN'
    if (status === 404) return 'NOT_FOUND'
    return 'ERROR'
  }
}
