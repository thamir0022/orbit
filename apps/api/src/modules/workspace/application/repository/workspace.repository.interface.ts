import { IBaseRepository, PaginatedResult } from '@/shared/application'
import { Workspace } from '../../domain/entities/workspace.entity'
import { WorkspaceId } from '../../domain/value-objects'
import { WorkspaceListItem } from '../model/workspaces-list'
import { UserId } from '@/modules/user/domain'
import { WorkspaceStatus } from '../../domain'

export interface ActiveWorkspaceContext {
  workspace: Workspace
  roleId: string
}

export interface FindActiveContextParams {
  workspaceId: string
  userId: string
}

export interface FindActiveContextBySlugParams {
  slug: string
  userId: UserId
}

export interface FindUserWorkspacesParams {
  userId: string
}

export type FindWorkspaceQuery = {
  page: number
  limit: number
  search?: string
  status?: WorkspaceStatus
}

export interface IWorkspaceRepository extends IBaseRepository<
  Workspace,
  WorkspaceId
> {
  findBySlug(slug: string): Promise<Workspace | null>
  findAll(query: FindWorkspaceQuery): Promise<PaginatedResult<Workspace[] | []>>
  findByUserId(params: FindUserWorkspacesParams): Promise<WorkspaceListItem[]>
  findActiveContext(
    params: FindActiveContextParams
  ): Promise<ActiveWorkspaceContext | null>
  findActiveContextBySlug(
    params: FindActiveContextBySlugParams
  ): Promise<ActiveWorkspaceContext | null>
  isMember(workspaceId: WorkspaceId, userId: UserId): Promise<boolean>
}

export const WORKSPACE_REPOSITORY = Symbol('IWorkspaceRepository')
