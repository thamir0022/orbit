import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Put,
  Post,
  Query,
  UseGuards,
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
import { CurrentTenant } from '@/shared/presentation/decorators/current-tenent.decorator'
import {
  type RefreshTokenPayload,
  type AccessTokenPayload,
} from '@/shared/domain/types'
import { AccessTokenGuard } from '@/shared/infrastructure/security/guards/access-token.guard'
import { RefreshTokenGuard } from '@/shared/infrastructure/security/guards/refresh-token.guard'
import { CurrentIdentity } from '@/shared/presentation/decorators/current-identity.decorator'
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
  @UseGuards(RefreshTokenGuard)
  async getUserWorkspaces(
    @CurrentIdentity() identity: RefreshTokenPayload
  ): Promise<GetUserWorkspacesResponseDto> {
    return await this.getUserWorkspacesUseCase.execute({
      userId: identity.sub,
    })
  }

  @Get('active')
  @UseGuards(AccessTokenGuard)
  @ResponseMessage(Messages.GET_WORKSPACE_SUCCESS)
  async currentWorkSpace(@CurrentTenant() tenant: AccessTokenPayload) {
    return await this.getActiveWorkspace.execute({
      userId: tenant.sub,
      workspaceId: tenant.tid,
    })
  }

  @Get('all')
  // @UseGuards(AccessTokenGuard)
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
  @UseGuards(AccessTokenGuard, RefreshTokenGuard)
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
    @CurrentTenant()
    tenant: AccessTokenPayload,
    @Query('roleId') roleId?: string,
    @Query('search') search?: string
  ): Promise<GetWorkspaceMembersReponse> {
    return await this.getWorkspaceMembersUseCase.execute({
      workspaceId: tenant.tid!,
      limit,
      page,
      roleId,
      search,
      status,
    })
  }

  @Get('/members/:id')
  @UseGuards(AccessTokenGuard, RefreshTokenGuard)
  async getWorkspaceMember(
    @Param('id') memberId: string,
    @CurrentTenant() tenant: AccessTokenPayload
  ) {
    return this.getWorkspaceMemberUseCase.execute({
      memberId,
      workspaceId: tenant.tid!,
    })
  }

  @Patch('/members/:id')
  @UseGuards(AccessTokenGuard, RefreshTokenGuard)
  async updateWorkspaceMember(
    @Param('id') memberId: string,
    @Body() { roleId, status }: UpdateWorkspaceMemberRequest,
    @CurrentTenant() tenant: AccessTokenPayload
  ) {
    return this.updateWorkspaceMemberUseCase.execute({
      memberId,
      workspaceId: tenant.tid!,
      roleId,
      status,
    })
  }

  @Delete('/members/:id/remove')
  @UseGuards(AccessTokenGuard, RefreshTokenGuard)
  async removeWorkspaceMember(
    @Param('id') memberId: string,
    @CurrentTenant() tenant: AccessTokenPayload
  ) {
    return this.removeWorkspaceMemberUseCase.execute({
      memberId,
      workspaceId: tenant.tid!,
    })
  }

  @Post()
  @UseGuards(RefreshTokenGuard)
  async createWorkspace(
    @CurrentIdentity() identity: RefreshTokenPayload,
    @Body() request: CreateWorkspaceRequest
  ): Promise<CreateWorkspaceResponse> {
    return await this.createWorkspaceUseCase.execute({
      name: request.name,
      slug: request.slug,
      userId: identity.sub,
      companySize: request.companySize,
      companyType: request.companyType,
    })
  }

  @Put()
  @UseGuards(RefreshTokenGuard, AccessTokenGuard)
  async editWorkspace(
    @Body() request: EditWorkspaceRequest,
    @CurrentIdentity() identity: RefreshTokenPayload,
    @CurrentTenant() tenant: AccessTokenPayload
  ): Promise<EditWorkspaceResponse> {
    const { name, slug, companySize, companyType } = request

    return await this.editWorkspaceUseCase.execute({
      userId: identity.sub,
      workspaceId: tenant.tid!,
      name,
      slug,
      companySize,
      companyType,
    })
  }

  @Post('invite')
  @UseGuards(RefreshTokenGuard, AccessTokenGuard)
  async inviteWorkspaceMember(
    @CurrentIdentity() identity: RefreshTokenPayload,
    @CurrentTenant() tenant: AccessTokenPayload,
    @Body() request: InviteWorkspaceMemberRequest
  ): Promise<InviteWorkspaceMemberResponse> {
    return await this.inviteWorkspaceMemberUseCase.execute({
      workspaceId: tenant.tid!,
      invitedBy: identity.sub,
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
  @UseGuards(RefreshTokenGuard)
  async acceptWorkspaceInvitation(
    @CurrentIdentity() identity: RefreshTokenPayload,
    @Param('token', WorkspaceInvitationTokenPipe) token: string
  ): Promise<AcceptWorkspaceInvitationReponse> {
    return this.acceptWorkspaceInvitationUseCase.execute({
      token,
      userId: identity.sub,
    })
  }

  @Post('roles')
  @UseGuards(AccessTokenGuard, RefreshTokenGuard)
  async createWorkspaceRole(
    @CurrentIdentity() identity: RefreshTokenPayload,
    @CurrentTenant() tenant: AccessTokenPayload,
    @Body() request: CreateWorkspaceRoleRequest
  ): Promise<CreateWorkspaceRoleResponse> {
    return this.createWorkspaceRoleUseCase.execute({
      workspaceId: tenant.tid!,
      name: request.name,
      description: request.description,
      permissionIds: request.permissionIds,
      createdBy: identity.sub,
    })
  }

  @Get('roles')
  @UseGuards(AccessTokenGuard, RefreshTokenGuard)
  async workspaceRoles(
    @Query('name') name: string,
    @Query('scope') scope: RoleScope,
    @Query('status') status: RoleStatus,
    @Query('type') type: 'all' | 'assignable',
    @CurrentTenant() tenant: AccessTokenPayload
  ) {
    return this.getworkspaceRoles.execute({
      workspaceId: tenant.tid!,
      name,
      scope,
      status,
      type: type ?? 'assignable',
    })
  }

  @Patch('roles/:id')
  @UseGuards(RefreshTokenGuard, AccessTokenGuard)
  async updateWorkspaceRole(
    @Param('id') roleId: string,
    @Body() request: UpdateWorkspaceRoleRequest,
    @CurrentTenant() tenant: AccessTokenPayload
  ): Promise<UpdateWorkspaceRoleResponse> {
    return this.updateWorkspaceRoleUseCase.execute({
      roleId: roleId,
      workspaceId: tenant.tid!,
      permissionIds: request.permissionIds,
      description: request.description,
      name: request.name,
      status: request.status,
    })
  }

  @Delete('roles/:id')
  @UseGuards(RefreshTokenGuard, AccessTokenGuard)
  async deleteWorkspaceRole(
    @Param('id') roleId: string,
    @CurrentTenant() tenant: AccessTokenPayload
  ): Promise<void> {
    return this.deleteWorkspaceRoleUseCase.execute({
      roleId,
      workspaceId: tenant.tid!,
    })
  }

  @Get('permissions')
  async getWorkspacePermissions() {
    return this.getWorkspacePermissionsUseCase.execute()
  }
}
