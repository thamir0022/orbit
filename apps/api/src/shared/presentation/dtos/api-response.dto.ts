import { ApiProperty } from '@nestjs/swagger'

export class ApiResponseDto<T> {
  @ApiProperty({ example: true })
  success: boolean

  @ApiProperty({ example: 200 })
  statusCode: number

  @ApiProperty({ example: 'Operation successful' })
  message: string

  @ApiProperty({ example: '{user: {id: 1234, email: "john@mail.com"}}' })
  data: T

  @ApiProperty({ example: '2026-02-09T12:00:00Z' })
  timestamp: string

  @ApiProperty({ example: '/api/v1/auth/login' })
  path: string

  @ApiProperty({ example: 'POST' })
  method: string

  @ApiProperty({ required: false, nullable: true })
  error: {
    code: string
    message: string
  } | null
}
