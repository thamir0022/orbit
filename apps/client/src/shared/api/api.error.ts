export class ApiError extends Error {
  statusCode: number
  code?: string
  details?: unknown

  constructor(
    message: string,
    options: {
      statusCode: number
      code?: string
      details?: unknown
    }
  ) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = options.statusCode
    this.code = options.code
    this.details = options.details
  }
}
