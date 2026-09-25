import { ApiProperty } from '@nestjs/swagger'

import { TeamMemberStatus } from '@/modules/team/domain/enums/team-member-status.enum'
import { UserSummaryResponseDto } from '@/shared/presentation/dtos/responses/user-summary.response'

export class TeamMemberResponseDto {
  @ApiProperty({
    description: 'User who belongs to the team',
    type: () => UserSummaryResponseDto,
  })
  readonly userId!: UserSummaryResponseDto

  @ApiProperty({
    description: 'Current membership status',
    enum: TeamMemberStatus,
    enumName: 'TeamMemberStatus',
    example: TeamMemberStatus.ACTIVE,
  })
  readonly status!: TeamMemberStatus

  @ApiProperty({
    description: 'User who added the member to the team',
    type: () => UserSummaryResponseDto,
  })
  readonly addedBy!: UserSummaryResponseDto

  @ApiProperty({
    description: 'Date and time when the user joined the team',
    type: String,
    format: 'date-time',
    example: '2026-09-25T10:30:00.000Z',
  })
  readonly joinedAt!: Date
}
