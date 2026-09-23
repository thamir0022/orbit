import { ApiProperty } from '@nestjs/swagger'
import { TeamResponseDto } from './team.response.dto'

export class CreateTeamResponse {
  @ApiProperty({
    description: 'The newly created team',
    type: () => TeamResponseDto,
  })
  team!: TeamResponseDto
}
