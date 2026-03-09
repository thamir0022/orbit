import { HttpStatusCode } from 'axios'

export interface ApiSuccess<T> {
  success: true
  statusCode: HttpStatusCode
  message?: string
  data: T
  timestamp: string
  path: string
  method: string
}

export interface ApiError {
  success: false
  statusCode: HttpStatusCode
  message: string
  error?: Record<string, string> | null
  timestamp: string
  path: string
  method: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError
