import { ApiProperty } from '@nestjs/swagger'
import { TeamResponseDto } from './team.response.dto'

export class GetTeamsResponse {
  @ApiProperty({
    description: 'Teams data',
    type: () => [TeamResponseDto],
  })
  readonly teams!: TeamResponseDto[]
}
