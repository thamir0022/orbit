import { trim } from '@/shared/utils'
import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsUUID, Matches } from 'class-validator'

export class RemoveTeamMemberRequest {
  @ApiProperty({
    description: 'Team that owns the sprint',
    example: 'ABC-A1B2C3D4',
  })
  @Transform(trim)
  @Matches(/^[A-Z0-9]{3}-[A-F0-9]{8}$/, {
    message: 'Team key must be in the format ABC-A1B2C3D4',
  })
  readonly teamKey!: string

  @ApiProperty({
    type: 'string',
    format: 'uuid',
    example: '0192f8c4-7a1b-7c32-8f4d-123456789abc',
  })
  @IsUUID('7', { message: 'Invalid member id' })
  readonly memberId!: string
}
