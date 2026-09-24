import { WorkspaceId } from '@/modules/workspace/domain'
import { UserId } from '@/modules/user/domain'

import { TeamMember } from '../../domain/entities/team-member.entity'
import { TeamMemberId } from '../../domain/value-objects/team-member-id.vo'
import { TeamMemberDto } from '../contracts/team-member.dto'
import { TeamMemberDocument } from '../../infrastructure/persistance/schemas/team-member.schema'
import { TeamId } from '../../domain/value-objects/team-id.vo'

export class TeamMemberMapper {
  static toDomainDto(document: TeamMemberDocument): TeamMember {
    return TeamMember.reconstitute({
      id: TeamMemberId.fromString(document.id),
      workspaceId: WorkspaceId.fromString(document.workspaceId),
      teamId: TeamId.fromString(document.teamId),
      userId: UserId.fromString(document.userId),
      status: document.status,
      addedBy: UserId.fromString(document.userId),
      joinedAt: document.joinedAt,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    })
  }

  static toOutputDto(teamMember: TeamMember): TeamMemberDto {
    return {
      id: teamMember.id.value,
      workspaceId: teamMember.workspaceId.value,
      teamId: teamMember.teamId.value,
      userId: teamMember.userId.value,
      status: teamMember.status,
      addedBy: teamMember.addedBy.value,
      joinedAt: teamMember.joinedAt,
      createdAt: teamMember.createdAt,
      updatedAt: teamMember.updatedAt,
    }
  }

  static toPersistance(teamMember: TeamMember): Partial<TeamMemberDocument> {
    return {
      id: teamMember.id.value,
      workspaceId: teamMember.workspaceId.value,
      teamId: teamMember.teamId.value,
      userId: teamMember.userId.value,
      status: teamMember.status,
      joinedAt: teamMember.joinedAt,
      addedBy: teamMember.addedBy.value,
      createdAt: teamMember.createdAt,
      updatedAt: teamMember.updatedAt,
    }
  }
}
