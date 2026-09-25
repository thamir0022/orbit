import { IBaseRepository, ITransactionOptions } from '@/shared/application'
import { WorkspaceMember } from '../../domain/entities/workspace-member.entity'
import { WorkspaceId, WorkspaceMemberStatus } from '../../domain'
import { Email, UserId } from '@/modules/user/domain'
import { PaginatedResult } from '@/shared/application/repository/paginated-result'
import { WorkspaceMemberDto } from '../model/workspace-member'
import { RoleId } from '@/modules/authorization/domain/value-objects/role-id.vo'

export interface FindWorkspaceMembersQuery {
  readonly workspaceId: string

  readonly page: number

  readonly limit: number

  readonly search?: string

  readonly roleId?: string

  readonly status?: WorkspaceMemberStatus
}

export interface ExistsWorkspaceMemberQuery {
  readonly workspaceId: WorkspaceId
  readonly userId?: UserId
  readonly email?: Email
}

export interface FindMemberQuery {
  readonly workspaceId: WorkspaceId
  readonly memberId: UserId
}

export interface FindWorkspaceMembersByWorkspaceIdAndUserIdsProps {
  workspaceId: WorkspaceId
  userIds: UserId[]
}

export interface IWorkspaceMemberRepository extends IBaseRepository<
  WorkspaceMember,
  string
> {
  exists(query: ExistsWorkspaceMemberQuery): Promise<boolean>
  findAll(
    query: FindWorkspaceMembersQuery
  ): Promise<PaginatedResult<WorkspaceMemberDto[]>>
  findMember(query: FindMemberQuery): Promise<WorkspaceMemberDto | null>
  replaceRole(
    oldRoleId: RoleId,
    newRoleId: RoleId,
    options?: ITransactionOptions
  ): Promise<void>
  findMembersByWorkspaceIdAndUserIds(
    props: FindWorkspaceMembersByWorkspaceIdAndUserIdsProps,
    options?: ITransactionOptions
  ): Promise<WorkspaceMember[]>
}

export const WORKSPACE_MEMBER_REPOSITORY = Symbol('WORKSPACE_MEMBER_REPOSITORY')
