import { ApiProperty } from '@nestjs/swagger'
import { TeamResponseDto } from './team.response.dto'

export class UpdateTeamResponse {
  @ApiProperty({
    description: 'Updated team data',
    type: () => TeamResponseDto,
  })
  readonly team!: TeamResponseDto
}
