import { PaginationMeta } from '@/shared/application'
import { WorkspaceDto } from '@/shared/domain/types'

export interface GetAllWorkspaceOutput {
  workspaces: WorkspaceDto[]
  meta: PaginationMeta
}
