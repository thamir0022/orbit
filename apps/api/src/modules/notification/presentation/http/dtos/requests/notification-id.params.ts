import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

/** Validated UUID path parameter identifying a notification. */
export class NotificationIdParams {
  @ApiProperty({
    description: 'Notification UUID.',
    format: 'uuid',
    example: '019c74bd-9862-7369-b600-0eed36827f90',
  })
  @IsUUID('all')
  id!: string
}
