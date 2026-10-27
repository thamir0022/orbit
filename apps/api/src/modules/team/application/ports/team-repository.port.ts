import { IBaseRepository, ITransactionOptions } from '@/shared/application'
import { Team } from '../../domain/entities/team.entity'
import { TeamId } from '../../domain/value-objects/team-id.vo'
import { WorkspaceId } from '@/modules/workspace/domain'
import { TeamKey } from '../../domain/value-objects/team-key.vo'

export interface FindTeamByWorkspaceIdAndKeyProps {
  workspaceId: WorkspaceId
  key: TeamKey
}

export interface FindTeamByWorkspaceIdAndNameProps {
  workspaceId: WorkspaceId
  name: string
}

export interface TeamRepository extends IBaseRepository<Team, TeamId> {
  findByWorkspaceId(
    workspaceId: WorkspaceId,
    options?: ITransactionOptions
  ): Promise<Team[]>

  findByWorkspaceIdAndId(
    workspaceId: WorkspaceId,
    id: TeamId,
    options?: ITransactionOptions
  ): Promise<Team | null>

  findByWorkspaceIdAndKey(
    props: FindTeamByWorkspaceIdAndKeyProps,
    options?: ITransactionOptions
  ): Promise<Team | null>

  findByWorkspaceIdAndName(
    props: FindTeamByWorkspaceIdAndNameProps,
    options?: ITransactionOptions
  ): Promise<Team | null>
}

export const TEAM_REPOSITORY = Symbol('ITeamRepository')
