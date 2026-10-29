import { WorkspaceId } from '@/modules/workspace/domain'
import { UserId } from '@/modules/user/domain'

import { TeamMember } from '../../domain/entities/team-member.entity'
import { TeamMemberId } from '../../domain/value-objects/team-member-id.vo'
import { TeamMemberDto } from '../contracts/team-member.dto'
import { TeamMemberDocument } from '../../infrastructure/persistance/schemas/team-member.schema'
import { TeamId } from '../../domain/value-objects/team-id.vo'

/** Maps hydrated UUID-backed membership documents to domain entities. */
export class TeamMemberMapper {
  static toDomainDto(document: TeamMemberDocument): TeamMember {
    return TeamMember.reconstitute({
      id: TeamMemberId.fromString(String(document.id)),
      workspaceId: WorkspaceId.fromString(String(document.workspaceId)),
      teamId: TeamId.fromString(String(document.teamId)),
      userId: UserId.fromString(String(document.userId)),
      status: document.status,
      addedBy: UserId.fromString(String(document.addedBy)),
      joinedAt: document.joinedAt,
      removedBy: document.removedBy
        ? UserId.create(String(document.removedBy))
        : null,
      removedAt: document.removedAt ? document.removedAt : null,
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
      removedBy: teamMember.removedBy ? teamMember.removedBy.value : null,
      removedAt: teamMember.removedAt,
      createdAt: teamMember.createdAt,
      updatedAt: teamMember.updatedAt,
    }
  }
}
