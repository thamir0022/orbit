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
import { Reflector } from '@nestjs/core'
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator'

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponseDto<T>
> {
  constructor(private reflector: Reflector) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<ApiResponseDto<T>> {
    const ctx = context.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()
    const statusCode = response.statusCode

    // Retrieve the message from the handler or class
    const message =
      this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || 'Request processed successfully'

    return next.handle().pipe(
      map((data: T) => {
        return {
          success: true,
          statusCode,
          message,
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
