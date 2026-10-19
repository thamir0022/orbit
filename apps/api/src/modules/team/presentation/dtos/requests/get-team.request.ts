import { trim } from '@/shared/utils'
import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { Matches } from 'class-validator'

export class GetTeamRequest {
  @ApiProperty({
    description: 'Team that owns the sprint',
    example: 'ABC-A1B2C3D4',
  })
  @Transform(trim)
  @Matches(/^[A-Z0-9]{3}-[A-F0-9]{8}$/, {
    message: 'Team key must be in the format ABC-A1B2C3D4',
  })
  readonly key!: string
}
