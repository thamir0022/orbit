import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

export class GetTeamMembersRequest {
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    example: '0192f8c4-7a1b-7c32-8f4d-123456789abc',
  })
  @IsUUID('7', { message: 'Invalid team id' })
  readonly teamId!: string
}
