import { ApiProperty } from '@nestjs/swagger'
import { TeamResponseDto } from './team.response.dto'

export class GetTeamResponse {
  @ApiProperty({
    description: 'Team data',
    type: () => TeamResponseDto,
  })
  readonly team!: TeamResponseDto
}
