import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common'
import type { Response } from 'express'
import { FileDomainErrorCode, FileDomainException } from '@/modules/file/domain'
import {
  FileApplicationError,
  FileApplicationErrorCode,
} from '@/modules/file/application/errors/file-application.error'
import { RepositoryConflictError } from '@/modules/file/application/ports/repositories/repository-snapshot'

const APPLICATION_STATUS: Record<FileApplicationErrorCode, number> = {
  [FileApplicationErrorCode.INVALID_REQUEST]: HttpStatus.BAD_REQUEST,
  [FileApplicationErrorCode.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [FileApplicationErrorCode.FORBIDDEN]: HttpStatus.FORBIDDEN,
  [FileApplicationErrorCode.CONFLICT]: HttpStatus.CONFLICT,
  [FileApplicationErrorCode.FILE_TOO_LARGE]: HttpStatus.PAYLOAD_TOO_LARGE,
  [FileApplicationErrorCode.UNSUPPORTED_MEDIA]:
    HttpStatus.UNSUPPORTED_MEDIA_TYPE,
  [FileApplicationErrorCode.FILE_UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
  [FileApplicationErrorCode.EXPIRED_UPLOAD]: HttpStatus.GONE,
}

/** Maps only known business errors; unexpected infrastructure failures retain Nest's default 500 handling. */
@Catch(FileApplicationError, FileDomainException, RepositoryConflictError)
export class FileHttpExceptionFilter implements ExceptionFilter {
  catch(
    error: FileApplicationError | FileDomainException | RepositoryConflictError,
    host: ArgumentsHost
  ): void {
    const response = host.switchToHttp().getResponse<Response>()
    response.setHeader('Cache-Control', 'no-store')
    if (error instanceof FileApplicationError) {
      const status = APPLICATION_STATUS[error.code]
      response
        .status(status)
        .json({ statusCode: status, code: error.code, message: error.message })
      return
    }
    if (error instanceof RepositoryConflictError) {
      response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        code: 'FILE_CONCURRENT_MODIFICATION',
        message: 'This file was changed concurrently. Retry the request.',
      })
      return
    }
    const status =
      error.code === FileDomainErrorCode.INVALID_STATE ||
      error.code === FileDomainErrorCode.SCAN_REQUIRED
        ? HttpStatus.CONFLICT
        : error.code === FileDomainErrorCode.QUOTA_EXCEEDED
          ? HttpStatus.PAYLOAD_TOO_LARGE
          : HttpStatus.BAD_REQUEST
    response
      .status(status)
      .json({ statusCode: status, code: error.code, message: error.message })
  }
}
