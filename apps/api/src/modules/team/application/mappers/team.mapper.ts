import { Team } from '../../domain/entities/team.entity'
import { TeamDto } from '../contracts/team.dto'
import { TeamDocument } from '../../infrastructure/persistance/schemas/team.schema'
import { TeamId } from '../../domain/value-objects/team-id.vo'
import { WorkspaceId } from '@/modules/workspace/domain'
import { UserId } from '@/modules/user/domain'

export class TeamMapper {
  static toDomainDto(document: TeamDocument): Team {
    return Team.reconstitute({
      id: TeamId.fromString(document.id),
      workspaceId: WorkspaceId.fromString(document.workspaceId),
      name: document.name,
      description: document.description,
      avatar: document.avatarUrl,
      status: document.status,
      ...(document.leadId && { leadId: UserId.fromString(document.leadId) }),
      createdBy: UserId.fromString(document.createdBy),
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    })
  }

  static toOutputDto(team: Team): TeamDto {
    return {
      id: team.id.value,
      workspaceId: team.workspaceId.value,
      name: team.name,
      description: team.description,
      avatar: team.avatar,
      leadId: team.leadId?.value,
      status: team.status,
      createdBy: team.createdBy.value,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    }
  }

  static toPersistance(team: Team): Partial<TeamDocument> {
    return {
      id: team.id.value,
      workspaceId: team.workspaceId.value,
      name: team.name,
      description: team.description,
      avatarUrl: team.avatar,
      leadId: team.leadId?.value,
      status: team.status,
      createdBy: team.createdBy.value,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    }
  }
}
