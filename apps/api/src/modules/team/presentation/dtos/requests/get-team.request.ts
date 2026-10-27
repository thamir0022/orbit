import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { Matches } from 'class-validator'

import { trim } from '@/shared/utils'

export class GetTeamRequest {
  @ApiProperty({
    description: 'Key of the team that owns the sprint',
    example: 'ENG',
    pattern: '^[A-Z][A-Z0-9]{0,9}$',
  })
  @Transform(trim)
  @Matches(/^[A-Z][A-Z0-9]{0,9}$/, {
    message:
      'Team key must start with an uppercase letter and contain only uppercase letters or numbers (maximum 10 characters)',
  })
  readonly key!: string
}
