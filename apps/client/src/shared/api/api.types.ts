interface BaseResponse {
  statusCode: number
  message: string
  timestamp: string
  path: string
  method: string
}

export interface ApiSuccess<T> extends BaseResponse {
  success: true
  data: T
}

export interface ApiError extends BaseResponse {
  success: false
  error: {
    code: string
    message: string
  }
}

// The discriminated union
export type ApiResponse<T = null> = ApiSuccess<T> | ApiError
