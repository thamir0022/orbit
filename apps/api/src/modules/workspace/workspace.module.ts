import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  WorkspaceModel,
  WorkspaceSchema,
} from './infrastructure/persistence/schema/workspace.schema'
import { WorkspaceController } from './presentation/controllers/workspace.controller'
import { workspaceProviders } from './infrastructure/providers/workspace.providers'
import {
  WORKSPACE_MEMBER_REPOSITORY,
  WORKSPACE_REPOSITORY,
} from './application'
import {
  WorkspaceMemberModel,
  WorkspaceMemberSchema,
} from './infrastructure/persistence/schema/workspace-member.schema'
import { GET_ACTIVE_WORKSPACE } from './application/usecases/active-workspace.interface'
import { GetActiveWorkspaceUseCase } from './application/usecases/active-workspace.usecase'
import { GET_USER_WORKSPACES } from './application/usecases/get-user-workspaces.interface'
import { GetUserWorkspacesUseCase } from './application/usecases/get-user-workspaces.usecase'
import { GET_ALL_WORKSPACES } from './application/usecases/get-all-workspace.interface'
import { GetAllWorkspaceUseCase } from './application/usecases/get-all-workspace.usecase'
import { CREATE_WORKSPACE } from './application/usecases/create-workspace.interface'
import { CreateWorkspaceUseCase } from './application/usecases/create-workspace.usecase'
import { AuthorizationModule } from '../authorization/authorization.module'
import { EDIT_WORKSPACE } from './application/usecases/edit-workspace.interface'
import { EditWorkspaceUseCase } from './application/usecases/edit-workspace.usecase'
import {
  WorkspaceInvitationModel,
  WorkspaceInvitationSchema,
} from './infrastructure/persistence/schema/workspace-invitation.schema'
import { INVITE_WORKSPACE_MEMBER } from './application/usecases/invite-workspace-member.interface'
import { InviteWorkspaceMemberUseCase } from './application/usecases/invite-workspace-member.usecase'
import { UserModule } from '../user/user.module'
import { WORKSPACE_INVITATION_SERVICE } from './application/services/workspace-invitation.service.interface'
import { WorkspaceInvitationService } from './application/services/workspace-invitation.service'
import { GET_WORKSPACE_INVITATION } from './application/usecases/get-workspace-invitation.interface'
import { GetWorkspaceInvitationUseCase } from './application/usecases/get-workspace-invitation.usecase'
import { ACCEPT_WORKSPACE_INVITATION } from './application/usecases/accept-workspace-invitation.interface'
import { AcceptWorkspaceInvitationUseCase } from './application/usecases/accept-workspace-invitation.usecase'
import { GET_WORKSPACE_MEMBERS } from './application/usecases/get-workspace-members.interface'
import { GetWorkspaceMembersUseCase } from './application/usecases/get-workspace-members.usecase'
import { WORKSPACE_INVITATION_REPOSITORY } from './application/repository/workspace-invitation.repository.interface'
import { GET_WORKSPACE_ROLES } from './application/usecases/get-workspace-roles.interface'
import { GetWorkspaceRoles } from './application/usecases/get-workspace-roles.usecase'
import { GET_WORKSPACE_MEMBER } from './application/usecases/get-workspace-member.interface'
import { GetWorkspaceMemberUseCase } from './application/usecases/get-workspace-member.usecase'
import { UPDATE_WORKSPACE_MEMBER } from './application/usecases/update-workspace-member.interface'
import { UpdateWorkspaceMemberUsecase } from './application/usecases/update-workspace-member.usecase'
import { REMOVE_WORKSPACE_MEMBER } from './application/usecases/remove-workspace-member.interface'
import { RemoveWorkspaceMemberUseCase } from './application/usecases/remove-workspace-member.usecase'
import { GET_WORKSPACE_PERMISSIONS } from './application/usecases/get-workspace-permissions.interface'
import { GetWOrkspacePermissionsUseCase } from './application/usecases/get-workspace-permissions.usecase'
import { CREATE_WORKSPACE_ROLE } from './application/usecases/create-workspace-role.interface'
import { CreateWorkspaceRoleUseCase } from './application/usecases/create-workspace-role.usecase'
import { UPDATE_WORKSPACE_ROLE } from './application/usecases/update-workspace-role.interface'
import { UpdateWorkspaceRoleUseCase } from './application/usecases/update-workspace-role.usecase'
import { DELETE_WORKSPACE_ROLE } from './application/usecases/delete-workspace-role.interface'
import { DeleteWorkspaceUseCase } from './application/usecases/delete-workspace-role.usecase'

@Module({
  imports: [
    UserModule,
    AuthorizationModule,
    MongooseModule.forFeature([
      { name: WorkspaceModel.name, schema: WorkspaceSchema },
      { name: WorkspaceMemberModel.name, schema: WorkspaceMemberSchema },
      {
        name: WorkspaceInvitationModel.name,
        schema: WorkspaceInvitationSchema,
      },
    ]),
  ],
  controllers: [WorkspaceController],
  providers: [
    ...workspaceProviders,
    {
      provide: WORKSPACE_INVITATION_SERVICE,
      useClass: WorkspaceInvitationService,
    },
    {
      provide: GET_ACTIVE_WORKSPACE,
      useClass: GetActiveWorkspaceUseCase,
    },
    {
      provide: GET_USER_WORKSPACES,
      useClass: GetUserWorkspacesUseCase,
    },
    {
      provide: GET_ALL_WORKSPACES,
      useClass: GetAllWorkspaceUseCase,
    },
    {
      provide: CREATE_WORKSPACE,
      useClass: CreateWorkspaceUseCase,
    },
    {
      provide: EDIT_WORKSPACE,
      useClass: EditWorkspaceUseCase,
    },
    {
      provide: INVITE_WORKSPACE_MEMBER,
      useClass: InviteWorkspaceMemberUseCase,
    },
    {
      provide: GET_WORKSPACE_INVITATION,
      useClass: GetWorkspaceInvitationUseCase,
    },
    {
      provide: ACCEPT_WORKSPACE_INVITATION,
      useClass: AcceptWorkspaceInvitationUseCase,
    },
    {
      provide: GET_WORKSPACE_MEMBERS,
      useClass: GetWorkspaceMembersUseCase,
    },
    {
      provide: GET_WORKSPACE_ROLES,
      useClass: GetWorkspaceRoles,
    },
    {
      provide: GET_WORKSPACE_MEMBER,
      useClass: GetWorkspaceMemberUseCase,
    },
    {
      provide: UPDATE_WORKSPACE_MEMBER,
      useClass: UpdateWorkspaceMemberUsecase,
    },
    {
      provide: REMOVE_WORKSPACE_MEMBER,
      useClass: RemoveWorkspaceMemberUseCase,
    },
    {
      provide: GET_WORKSPACE_PERMISSIONS,
      useClass: GetWOrkspacePermissionsUseCase,
    },
    {
      provide: CREATE_WORKSPACE_ROLE,
      useClass: CreateWorkspaceRoleUseCase,
    },
    {
      provide: UPDATE_WORKSPACE_ROLE,
      useClass: UpdateWorkspaceRoleUseCase,
    },
    {
      provide: DELETE_WORKSPACE_ROLE,
      useClass: DeleteWorkspaceUseCase,
    },
  ],
  exports: [
    WORKSPACE_REPOSITORY,
    WORKSPACE_MEMBER_REPOSITORY,
    WORKSPACE_INVITATION_REPOSITORY,
    WORKSPACE_INVITATION_SERVICE,
  ],
})
export class WorkspaceModule {}
