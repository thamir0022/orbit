import { Email, UserId } from '@/modules/user/domain'
import { WorkspaceInvitation } from '../../domain/entities/workspace-invitation.entity'
import { WorkspaceInvitationDocument } from '../../infrastructure/persistence/schema/workspace-invitation.schema'
import { WorkspaceInvitationProps } from '../../domain/interfaces'
import { WorkspaceId, WorkspaceInvitationId } from '../../domain'
import { RoleId } from '@/modules/authorization/domain/value-objects/role-id.vo'

/**
 * Workspace Invitation Mapper
 *
 * Transforms between domain entities and persistence models.
 */
export class WorkspaceInvitationMapper {
  /**
   * Map domain entity to persistence model.
   */
  static toPersistence(
    invitation: WorkspaceInvitation
  ): Partial<WorkspaceInvitationDocument> {
    return {
      id: invitation.id.value,

      workspaceId: invitation.workspaceId.value,

      email: invitation.email.value,

      roleId: invitation.roleId.value,

      invitedBy: invitation.invitedBy.value,

      status: invitation.status,

      tokenHash: invitation.tokenHash,

      expiresAt: invitation.expiresAt,

      acceptedAt: invitation.acceptedAt,

      createdAt: invitation.createdAt,

      updatedAt: invitation.updatedAt,
    }
  }

  /**
   * Map persistence model to domain entity.
   */
  static toDomain(document: WorkspaceInvitationDocument): WorkspaceInvitation {
    const props: WorkspaceInvitationProps = {
      id: WorkspaceInvitationId.fromString(document.id),

      workspaceId: WorkspaceId.fromString(document.workspaceId),

      email: Email.create(document.email).value,

      roleId: RoleId.fromString(document.roleId),

      invitedBy: UserId.fromString(document.invitedBy),

      status: document.status,

      tokenHash: document.tokenHash,

      expiresAt: document.expiresAt,

      acceptedAt: document.acceptedAt,

      createdAt: document.createdAt,

      updatedAt: document.updatedAt,
    }

    return WorkspaceInvitation.reconstitute(props)
  }
}
