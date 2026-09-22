import { IBaseRepository, ITransactionOptions } from '@/shared/application'
import { Team } from '../../domain/entities/team.entity'
import { TeamId } from '../../domain/value-objects/team-id.vo'
import { WorkspaceId } from '@/modules/workspace/domain'

export interface FindTeamByWorkspaceIdAndIdProps {
  workspaceId: WorkspaceId
  teamId: TeamId
}

export interface DeleteTeamByWorkspaceIdAndIdProps {
  workspaceId: WorkspaceId
  teamId: TeamId
}

export interface TeamRepository extends IBaseRepository<Team, TeamId> {
  findByWorkspaceId(
    workspaceId: WorkspaceId,
    options?: ITransactionOptions
  ): Promise<Team[]>

  findByWorkspaceIdAndId(
    props: FindTeamByWorkspaceIdAndIdProps,
    options?: ITransactionOptions
  ): Promise<Team | null>

  deleteByWorkspaceIdAndId(
    props: DeleteTeamByWorkspaceIdAndIdProps,
    options?: ITransactionOptions
  ): Promise<void>
}

export const TEAM_REPOSITORY = Symbol('ITeamRepository')
