import { IBaseRepository } from '@/shared/application'

import { WorkspaceInvitation } from '../../domain/entities/workspace-invitation.entity'

import { WorkspaceInvitationId, WorkspaceId } from '../../domain/value-objects'

import { Email } from '@/modules/user/domain'

export interface IWorkspaceInvitationRepository extends IBaseRepository<
  WorkspaceInvitation,
  WorkspaceInvitationId
> {
  findByTokenHash(token: string): Promise<WorkspaceInvitation | null>

  findPendingByEmail(
    workspaceId: WorkspaceId,
    email: Email
  ): Promise<WorkspaceInvitation | null>

  existsPendingInvitation(
    workspaceId: WorkspaceId,
    email: Email
  ): Promise<boolean>

  revokeExpiredInvitations(): Promise<number>
}

export const WORKSPACE_INVITATION_REPOSITORY = Symbol(
  'WORKSPACE_INVITATION_REPOSITORY'
)
