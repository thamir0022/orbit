import { ITransactionOptions } from '@/shared/application'
import { WorkspaceId } from '@/modules/workspace/domain'
import { TeamId } from '../../domain/value-objects/team-id.vo'
import { TeamListItemOutput } from '../contracts/team-list-item.output'

export interface FindTeamByWorkspaceIdAndIdQueryProps {
  workspaceId: WorkspaceId
  teamId: TeamId
}

export interface TeamQueryRepository {
  findByWorkspaceId(
    workspaceId: WorkspaceId,
    options?: ITransactionOptions
  ): Promise<TeamListItemOutput[]>

  findByWorkspaceIdAndId(
    props: FindTeamByWorkspaceIdAndIdQueryProps,
    options?: ITransactionOptions
  ): Promise<TeamListItemOutput | null>
}

export const TEAM_QUERY_REPOSITORY = Symbol('TeamQueryRepository')
