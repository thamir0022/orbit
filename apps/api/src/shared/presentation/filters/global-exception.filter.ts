import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import type { Request } from 'express'

import { DomainException } from '@/shared/domain/exceptions/domain.exception'
import { ApiResponseDto } from '../dtos/responses/api-response.dto'

type NormalizedException = {
  statusCode: number
  message: string
  code: string
}

type HttpExceptionResponse = {
  message?: string | string[]
  error?: string
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name)

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost

    const ctx = host.switchToHttp()

    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()

    const path = httpAdapter.getRequestUrl(request) as string
    const method = request.method
    const timestamp = new Date().toISOString()

    const normalized = this.normalizeException(exception)

    this.logException(exception, {
      method,
      path,
      statusCode: normalized.statusCode,
      code: normalized.code,
    })

    const body: ApiResponseDto<null> = {
      success: false,
      statusCode: normalized.statusCode,
      message: normalized.message,
      data: null,
      error: {
        code: normalized.code,
        message: normalized.message,
      },
      timestamp,
      path,
      method,
    }

    httpAdapter.reply(response, body, normalized.statusCode)
  }

  private normalizeException(exception: unknown): NormalizedException {
    if (exception instanceof DomainException) {
      const statusCode = exception.httpStatusCode ?? HttpStatus.BAD_REQUEST

      return {
        statusCode,
        message: exception.message,
        code: exception.code ?? this.defaultCode(statusCode),
      }
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus()
      const response = exception.getResponse()

      return {
        statusCode,
        message: this.extractHttpExceptionMessage(response, exception.message),
        code: this.defaultCode(statusCode),
      }
    }

    if (exception instanceof Error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      }
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Unexpected error',
      code: 'INTERNAL_ERROR',
    }
  }

  private extractHttpExceptionMessage(
    response: string | object,
    fallbackMessage: string
  ): string {
    if (typeof response === 'string') {
      return response
    }

    const parsed = response as HttpExceptionResponse

    if (Array.isArray(parsed.message)) {
      return parsed.message.join(', ')
    }

    if (typeof parsed.message === 'string') {
      return parsed.message
    }

    if (typeof parsed.error === 'string') {
      return parsed.error
    }

    return fallbackMessage || 'Request failed'
  }

  private logException(
    exception: unknown,
    meta: {
      method: string
      path: string
      statusCode: number
      code: string
    }
  ): void {
    const message = `[${meta.method}] ${meta.path} -> ${meta.statusCode} (${meta.code})`

    if (exception instanceof Error) {
      this.logger.error(message, exception.stack)
      return
    }

    this.logger.error(
      `${message} | Non-Error thrown: ${this.safeSerialize(exception)}`
    )
  }

  private defaultCode(statusCode: number): string {
    if (statusCode >= 500) return 'INTERNAL_ERROR'
    if (statusCode === 400) return 'BAD_REQUEST'
    if (statusCode === 401) return 'UNAUTHORIZED'
    if (statusCode === 403) return 'FORBIDDEN'
    if (statusCode === 404) return 'NOT_FOUND'
    if (statusCode === 409) return 'CONFLICT'
    if (statusCode === 422) return 'VALIDATION_ERROR'

    return 'ERROR'
  }

  private safeSerialize(value: unknown): string {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
}
