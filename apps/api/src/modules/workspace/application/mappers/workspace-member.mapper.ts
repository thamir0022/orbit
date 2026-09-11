import { WorkspaceMember } from '../../domain/entities/workspace-member.entity'
import { WorkspaceMemberModel } from '../../infrastructure/persistence/schema/workspace-member.schema'
import { WorkspaceMemberStatus } from '../../domain/enums/workspace-member-status.enum'
import { WorkspaceId } from '../../domain'
import { UserId } from '@/modules/user/domain'
import { RoleId } from '@/modules/authorization/domain/value-objects/role-id.vo'

export class WorkspaceMemberMapper {
  public static toDomain(raw: WorkspaceMemberModel): WorkspaceMember {
    return WorkspaceMember.reconstitute({
      id: raw.id,
      workspaceId: WorkspaceId.fromString(raw.workspaceId),
      userId: UserId.fromString(raw.userId),
      roleId: RoleId.create(raw.roleId),
      status: raw.status as WorkspaceMemberStatus,
      invitedBy: raw.invitedBy,
      invitedAt: raw.invitedAt,
      joinedAt: raw.joinedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    })
  }

  public static toPersistence(member: WorkspaceMember): WorkspaceMemberModel {
    return {
      id: member.id,
      workspaceId: member.workspaceId.value,
      userId: member.userId.value,
      roleId: member.roleId.value,
      status: member.status,
      invitedBy: member.invitedBy,
      invitedAt: member.invitedAt,
      joinedAt: member.joinedAt,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    }
  }
}
