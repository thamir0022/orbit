import { Provider } from '@nestjs/common'
import {
  WORKSPACE_MEMBER_REPOSITORY,
  WORKSPACE_REPOSITORY,
} from '../../application'
import { WorkspaceRepository } from '../persistence/repository/workspace.repository'
import { WorkspaceMemberRepository } from '../persistence/repository/workspace-member.repository'
import { WORKSPACE_INVITATION_REPOSITORY } from '../../application/repository/workspace-invitation.repository.interface'
import { MongoWorkspaceInvitationRepository } from '../persistence/repository/workspace-invitation.repository'

export const workspaceProviders: Provider[] = [
  {
    provide: WORKSPACE_REPOSITORY,
    useClass: WorkspaceRepository,
  },
  {
    provide: WORKSPACE_MEMBER_REPOSITORY,
    useClass: WorkspaceMemberRepository,
  },
  {
    provide: WORKSPACE_INVITATION_REPOSITORY,
    useClass: MongoWorkspaceInvitationRepository,
  },
]
