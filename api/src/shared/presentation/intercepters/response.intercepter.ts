import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { ApiResponse } from '../../infrastructure'
import { Request, Response } from 'express'

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()
    const statusCode = response.statusCode

    return next.handle().pipe(
      map((data: T) => {
        return {
          success: true,
          statusCode,
          data,
          error: null,
          timestamp: new Date().toISOString(),
          path: request.url,
        }
      })
    )
  }
}
