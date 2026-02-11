import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Request, Response } from 'express'
import { ApiResponseDto } from '@/shared/presentation/dtos/api-response.dto'

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponseDto<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<ApiResponseDto<T>> {
    const ctx = context.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()
    const statusCode = response.statusCode

    return next.handle().pipe(
      map((data: T) => {
        return {
          success: true,
          statusCode,
          message: 'Success',
          data,
          error: null,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
        }
      })
    )
  }
}
