import { PaginationMeta } from '@/shared/application'
import { WorkspaceMemberSummary } from '../model/workspace-member-summary'

/** Pagination scoped to the authenticated workspace. */
export interface GetWorkspaceMemberSummariesInput {
  readonly workspaceId: string
  readonly page: number
  readonly limit: number
}

export interface GetWorkspaceMemberSummariesOutput {
  readonly workspaceMembers: WorkspaceMemberSummary[]
  readonly meta: PaginationMeta
}

/** Lists workspace members without exposing account or role details. */
export interface IGetWorkspaceMemberSummariesUseCase {
  execute(
    input: GetWorkspaceMemberSummariesInput
  ): Promise<GetWorkspaceMemberSummariesOutput>
}

export const GET_WORKSPACE_MEMBER_SUMMARIES = Symbol(
  'GET_WORKSPACE_MEMBER_SUMMARIES'
)
