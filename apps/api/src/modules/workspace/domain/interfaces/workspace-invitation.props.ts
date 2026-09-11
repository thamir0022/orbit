import { Email, UserId } from '@/modules/user/domain'
import { WorkspaceInvitationStatus } from '../enums/workspace-invitation-status.enum'
import { RoleId } from '@/modules/authorization/domain/value-objects/role-id.vo'
import { WorkspaceId, WorkspaceInvitationId } from '../value-objects'

export interface WorkspaceInvitationProps {
  id: WorkspaceInvitationId
  workspaceId: WorkspaceId
  email: Email
  roleId: RoleId
  invitedBy: UserId
  status: WorkspaceInvitationStatus
  tokenHash: string
  expiresAt: Date
  acceptedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateWorkspaceInvitaionProps {
  workspaceId: WorkspaceId
  email: Email
  roleId: RoleId
  invitedBy: UserId
  tokenHash: string
}
