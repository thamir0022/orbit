export interface ApiResponse<T> {
  success: boolean
  statusCode: number
  data: T | null
  error: {
    code: string
    message: string
    details?: any
  } | null
  timestamp: string
  path: string
}
