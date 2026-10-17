import { ITransactionOptions } from '@/shared/application'
import { WorkspaceId } from '@/modules/workspace/domain'
import { TeamListItemOutput } from '../contracts/team-list-item.output'
import { TeamSummaryOutput } from '../contracts/team-summary.output'
import { TeamKey } from '../../domain/value-objects/team-key.vo'

export interface FindTeamByWorkspaceIdAndKeyQueryProps {
  workspaceId: WorkspaceId
  key: TeamKey
}

export interface TeamQueryRepository {
  findByWorkspaceId(
    workspaceId: WorkspaceId,
    options?: ITransactionOptions
  ): Promise<TeamListItemOutput[]>

  findByWorkspaceIdAndKey(
    props: FindTeamByWorkspaceIdAndKeyQueryProps,
    options?: ITransactionOptions
  ): Promise<TeamListItemOutput | null>

  findSummariesByWorkspaceId(
    workspaceId: WorkspaceId,
    options?: ITransactionOptions
  ): Promise<readonly TeamSummaryOutput[]>
}

export const TEAM_QUERY_REPOSITORY = Symbol('TeamQueryRepository')
