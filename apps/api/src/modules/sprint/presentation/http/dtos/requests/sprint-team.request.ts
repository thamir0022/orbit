import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

// Shared by detail queries and lifecycle commands.
export class SprintTeamRequest {
  @ApiProperty({ description: 'Team that owns the sprint', format: 'uuid' })
  @IsUUID('7')
  readonly teamId!: string
}
