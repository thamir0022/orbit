import { WorkspaceMember } from '../../domain/entities/workspace-member.entity'
import { WorkspaceMemberModel } from '../../infrastructure/persistence/schema/workspace-member.schema'
import { WorkspaceMemberStatus } from '../../domain/enums/workspace-member-status.enum'
import { WorkspaceId } from '../../domain'
import { UserId } from '@/modules/user/domain'
import { RoleId } from '@/modules/authorization/domain/value-objects/role-id.vo'

/** Normalizes persisted UUID identities before constructing workspace members. */
export class WorkspaceMemberMapper {
  public static toDomain(raw: WorkspaceMemberModel): WorkspaceMember {
    return WorkspaceMember.reconstitute({
      id: String(raw.id),
      workspaceId: WorkspaceId.fromString(String(raw.workspaceId)),
      userId: UserId.fromString(String(raw.userId)),
      roleId: RoleId.create(String(raw.roleId)),
      status: raw.status as WorkspaceMemberStatus,
      invitedBy: raw.invitedBy ? String(raw.invitedBy) : null,
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
