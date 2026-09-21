import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Put,
  Post,
  Query,
  ParseIntPipe,
  ParseEnumPipe,
  DefaultValuePipe,
  Patch,
  Delete,
} from '@nestjs/common'
import { ResponseMessage } from '@/shared/presentation/decorators/response-message.decorator'
import { Messages } from '../enums/response-messages.enum'
import {
  GET_ACTIVE_WORKSPACE,
  type IGetActiveWorkspace,
} from '../../application/usecases/active-workspace.interface'
import {
  GET_USER_WORKSPACES,
  type IGetUserWorkspacesUseCase,
} from '../../application/usecases/get-user-workspaces.interface'
import {
  GET_ALL_WORKSPACES,
  type IGetAllWorkspaceUseCase,
} from '../../application/usecases/get-all-workspace.interface'
import {
  CREATE_WORKSPACE,
  type ICreateWorkspaceUseCase,
} from '../../application/usecases/create-workspace.interface'
import {
  AcceptWorkspaceInvitationReponse,
  CreateWorkspaceRequest,
  CreateWorkspaceResponse,
  CreateWorkspaceRoleRequest,
  EditWorkspaceRequest,
  EditWorkspaceResponse,
  GetUserWorkspacesResponseDto,
  GetWorkspaceInvitationResponse,
  GetWorkspaceMembersReponse,
  InviteWorkspaceMemberRequest,
  InviteWorkspaceMemberResponse,
  UpdateWorkspaceMemberRequest,
  UpdateWorkspaceRoleRequest,
  UpdateWorkspaceRoleResponse,
} from '../dtos'
import {
  EDIT_WORKSPACE,
  type IEditWorkspaceUseCase,
} from '../../application/usecases/edit-workspace.interface'
import {
  type IInviteWorkspaceMemberUseCase,
  INVITE_WORKSPACE_MEMBER,
} from '../../application/usecases/invite-workspace-member.interface'
import {
  GET_WORKSPACE_INVITATION,
  type IGetWorkspaceInvitationUseCase,
} from '../../application/usecases/get-workspace-invitation.interface'
import { WorkspaceInvitationTokenPipe } from '../pipes'
import {
  ACCEPT_WORKSPACE_INVITATION,
  type IAcceptWorkspaceInvitationUseCase,
} from '../../application/usecases/accept-workspace-invitation.interface'
import {
  GET_WORKSPACE_MEMBERS,
  type IGetWorkspaceMembersUseCase,
} from '../../application/usecases/get-workspace-members.interface'
import { WorkspaceMemberStatus } from '../../domain'
import {
  GET_WORKSPACE_ROLES,
  type IGetWorkspaceRoles,
} from '../../application/usecases/get-workspace-roles.interface'
import {
  GET_WORKSPACE_MEMBER,
  type IGetWorkspaceMemberUseCase,
} from '../../application/usecases/get-workspace-member.interface'
import {
  type IUpdateWorkspaceMemberUseCase,
  UPDATE_WORKSPACE_MEMBER,
} from '../../application/usecases/update-workspace-member.interface'
import {
  type IRemoveWorkspaceMemberUseCase,
  REMOVE_WORKSPACE_MEMBER,
} from '../../application/usecases/remove-workspace-member.interface'
import {
  GET_WORKSPACE_PERMISSIONS,
  type IGetWorkspacePermissionsUseCase,
} from '../../application/usecases/get-workspace-permissions.interface'
import {
  CREATE_WORKSPACE_ROLE,
  type ICreateWorkspaceRoleUseCase,
} from '../../application/usecases/create-workspace-role.interface'
import { CreateWorkspaceRoleResponse } from '../dtos/responses/create-workspace-role.response'
import { RoleScope } from '@/modules/authorization/domain/enums/role-scope.enum'
import { RoleStatus } from '@/modules/authorization/domain/enums/role-status.enum'
import {
  type IUpdateWorkspaceRoleUseCase,
  UPDATE_WORKSPACE_ROLE,
} from '../../application/usecases/update-workspace-role.interface'
import {
  DELETE_WORKSPACE_ROLE,
  type IDeleteWorkspaceRoleUseCase,
} from '../../application/usecases/delete-workspace-role.interface'
import { CurrentAuth } from '@/shared/presentation/decorators/current-auth.decorator'
import { AuthContext } from '@/shared/domain/types'

@Controller('workspaces')
export class WorkspaceController {
  constructor(
    @Inject(GET_ACTIVE_WORKSPACE)
    private readonly getActiveWorkspace: IGetActiveWorkspace,
    @Inject(GET_USER_WORKSPACES)
    private readonly getUserWorkspacesUseCase: IGetUserWorkspacesUseCase,
    @Inject(GET_ALL_WORKSPACES)
    private readonly getAllWorkspaceUseCase: IGetAllWorkspaceUseCase,
    @Inject(CREATE_WORKSPACE)
    private readonly createWorkspaceUseCase: ICreateWorkspaceUseCase,
    @Inject(EDIT_WORKSPACE)
    private readonly editWorkspaceUseCase: IEditWorkspaceUseCase,
    @Inject(INVITE_WORKSPACE_MEMBER)
    private readonly inviteWorkspaceMemberUseCase: IInviteWorkspaceMemberUseCase,
    @Inject(GET_WORKSPACE_INVITATION)
    private readonly getInvitationUseCase: IGetWorkspaceInvitationUseCase,
    @Inject(ACCEPT_WORKSPACE_INVITATION)
    private readonly acceptWorkspaceInvitationUseCase: IAcceptWorkspaceInvitationUseCase,
    @Inject(GET_WORKSPACE_MEMBERS)
    private readonly getWorkspaceMembersUseCase: IGetWorkspaceMembersUseCase,
    @Inject(GET_WORKSPACE_ROLES)
    private readonly getworkspaceRoles: IGetWorkspaceRoles,
    @Inject(GET_WORKSPACE_MEMBER)
    private readonly getWorkspaceMemberUseCase: IGetWorkspaceMemberUseCase,
    @Inject(UPDATE_WORKSPACE_MEMBER)
    private readonly updateWorkspaceMemberUseCase: IUpdateWorkspaceMemberUseCase,
    @Inject(REMOVE_WORKSPACE_MEMBER)
    private readonly removeWorkspaceMemberUseCase: IRemoveWorkspaceMemberUseCase,
    @Inject(CREATE_WORKSPACE_ROLE)
    private readonly createWorkspaceRoleUseCase: ICreateWorkspaceRoleUseCase,
    @Inject(UPDATE_WORKSPACE_ROLE)
    private readonly updateWorkspaceRoleUseCase: IUpdateWorkspaceRoleUseCase,
    @Inject(DELETE_WORKSPACE_ROLE)
    private readonly deleteWorkspaceRoleUseCase: IDeleteWorkspaceRoleUseCase,
    @Inject(GET_WORKSPACE_PERMISSIONS)
    private readonly getWorkspacePermissionsUseCase: IGetWorkspacePermissionsUseCase
  ) {}

  @Get()
  async getUserWorkspaces(
    @CurrentAuth('userId') userId: string
  ): Promise<GetUserWorkspacesResponseDto> {
    return await this.getUserWorkspacesUseCase.execute({
      userId,
    })
  }

  @Get('active')
  @ResponseMessage(Messages.GET_WORKSPACE_SUCCESS)
  async currentWorkSpace(@CurrentAuth() auth: AuthContext) {
    return await this.getActiveWorkspace.execute({
      userId: auth.userId,
      workspaceId: auth.workspaceId,
    })
  }

  @Get('all')
  @ResponseMessage(Messages.GET_WORKSPACE_SUCCESS)
  async getAllWorkspaces(
    @Query('page') page: number,
    @Query('limit') limit: number
  ) {
    const { workspaces, meta } = await this.getAllWorkspaceUseCase.execute({
      page,
      limit,
    })

    return {
      workspaces,
      meta,
    }
  }

  @Get('members')
  async getAllWorkspaceMembers(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query(
      'status',
      new ParseEnumPipe(WorkspaceMemberStatus, {
        optional: true,
      })
    )
    status: WorkspaceMemberStatus,
    @CurrentAuth('workspaceId') workspaceId: string,
    @Query('roleId') roleId?: string,
    @Query('search') search?: string
  ): Promise<GetWorkspaceMembersReponse> {
    return await this.getWorkspaceMembersUseCase.execute({
      workspaceId,
      limit,
      page,
      roleId,
      search,
      status,
    })
  }

  @Get('/members/:id')
  async getWorkspaceMember(
    @Param('id') memberId: string,
    @CurrentAuth('workspaceId') workspaceId: string
  ) {
    return this.getWorkspaceMemberUseCase.execute({
      memberId,
      workspaceId,
    })
  }

  @Patch('/members/:id')
  async updateWorkspaceMember(
    @Param('id') memberId: string,
    @Body() { roleId, status }: UpdateWorkspaceMemberRequest,
    @CurrentAuth('workspaceId') workspaceId: string
  ) {
    return this.updateWorkspaceMemberUseCase.execute({
      memberId,
      workspaceId,
      roleId,
      status,
    })
  }

  @Delete('/members/:id/remove')
  async removeWorkspaceMember(
    @Param('id') memberId: string,
    @CurrentAuth('workspaceId') workspaceId: string
  ) {
    return this.removeWorkspaceMemberUseCase.execute({
      memberId,
      workspaceId,
    })
  }

  @Post()
  async createWorkspace(
    @CurrentAuth('userId') userId: string,
    @Body() request: CreateWorkspaceRequest
  ): Promise<CreateWorkspaceResponse> {
    return await this.createWorkspaceUseCase.execute({
      name: request.name,
      slug: request.slug,
      userId,
      companySize: request.companySize,
      companyType: request.companyType,
    })
  }

  @Put()
  async editWorkspace(
    @Body() request: EditWorkspaceRequest,
    @CurrentAuth() auth: AuthContext
  ): Promise<EditWorkspaceResponse> {
    const { name, slug, companySize, companyType } = request

    return await this.editWorkspaceUseCase.execute({
      userId: auth.userId,
      workspaceId: auth.workspaceId!,
      name,
      slug,
      companySize,
      companyType,
    })
  }

  @Post('invite')
  async inviteWorkspaceMember(
    @CurrentAuth() auth: AuthContext,
    @Body() request: InviteWorkspaceMemberRequest
  ): Promise<InviteWorkspaceMemberResponse> {
    return await this.inviteWorkspaceMemberUseCase.execute({
      workspaceId: auth.workspaceId!,
      invitedBy: auth.userId,
      email: request.email,
      roleId: request.roleId,
    })
  }

  @Get('invite/:token')
  async getInvitation(
    @Param('token', WorkspaceInvitationTokenPipe) token: string
  ): Promise<GetWorkspaceInvitationResponse> {
    return this.getInvitationUseCase.execute({
      token,
    })
  }

  @Post('invite/:token/accept')
  async acceptWorkspaceInvitation(
    @CurrentAuth('userId') userId: string,
    @Param('token', WorkspaceInvitationTokenPipe) token: string
  ): Promise<AcceptWorkspaceInvitationReponse> {
    return this.acceptWorkspaceInvitationUseCase.execute({
      token,
      userId,
    })
  }

  @Post('roles')
  async createWorkspaceRole(
    @CurrentAuth() auth: AuthContext,
    @Body() request: CreateWorkspaceRoleRequest
  ): Promise<CreateWorkspaceRoleResponse> {
    return this.createWorkspaceRoleUseCase.execute({
      workspaceId: auth.workspaceId!,
      name: request.name,
      description: request.description,
      permissionIds: request.permissionIds,
      createdBy: auth.userId,
    })
  }

  @Get('roles')
  async workspaceRoles(
    @Query('name') name: string,
    @Query('scope') scope: RoleScope,
    @Query('status') status: RoleStatus,
    @Query('type') type: 'all' | 'assignable',
    @CurrentAuth('workspaceId') workspaceId: string
  ) {
    return this.getworkspaceRoles.execute({
      workspaceId,
      name,
      scope,
      status,
      type: type ?? 'assignable',
    })
  }

  @Patch('roles/:id')
  async updateWorkspaceRole(
    @Param('id') roleId: string,
    @Body() request: UpdateWorkspaceRoleRequest,
    @CurrentAuth('workspaceId') workspaceId: string
  ): Promise<UpdateWorkspaceRoleResponse> {
    return this.updateWorkspaceRoleUseCase.execute({
      roleId: roleId,
      workspaceId,
      permissionIds: request.permissionIds,
      description: request.description,
      name: request.name,
      status: request.status,
    })
  }

  @Delete('roles/:id')
  async deleteWorkspaceRole(
    @Param('id') roleId: string,
    @CurrentAuth('workspaceId') workspaceId: string
  ): Promise<void> {
    return this.deleteWorkspaceRoleUseCase.execute({
      roleId,
      workspaceId,
    })
  }

  @Get('permissions')
  async getWorkspacePermissions() {
    return this.getWorkspacePermissionsUseCase.execute()
  }
}
