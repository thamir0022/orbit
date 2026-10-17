import { Inject, Injectable } from '@nestjs/common'
import { GetTeamMembersInput, GetTeamMembersOutput } from '../dtos'
import { IGetTeamMembersUseCase } from './get-team-members.interface'
import {
  TEAM_MEMBER_QUERY_REPOSITORY,
  TeamMemberQueryRepository,
} from '../ports/team-member-query-repository.port'
import { TEAM_REPOSITORY, TeamRepository } from '../ports/team-repository.port'
import {
  IWorkspaceRepository,
  WORKSPACE_REPOSITORY,
} from '@/modules/workspace/application'
import { WorkspaceId, WorkspaceStatus } from '@/modules/workspace/domain'
import {
  WorkspaceNotActiveException,
  WorkspaceNotFoundException,
} from '@/modules/workspace/domain/exceptions/workspace.exception'
import {
  TeamInactiveException,
  TeamNotFoundException,
} from '../../domain/exceptions'
import { TeamKey } from '../../domain/value-objects/team-key.vo'

@Injectable()
export class GetTeamMembersUseCase implements IGetTeamMembersUseCase {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository,
    @Inject(TEAM_REPOSITORY)
    private readonly teamRepository: TeamRepository,
    @Inject(TEAM_MEMBER_QUERY_REPOSITORY)
    private readonly teamMemberQueryRepository: TeamMemberQueryRepository
  ) {}

  async execute(input: GetTeamMembersInput): Promise<GetTeamMembersOutput> {
    const workspaceId = WorkspaceId.create(input.workspaceId)
    const key = TeamKey.create(input.teamKey)

    const [workspace, team] = await Promise.all([
      this.workspaceRepository.findById(workspaceId),
      this.teamRepository.findByWorkspaceIdAndKey({
        workspaceId,
        key,
      }),
    ])

    if (!workspace) throw new WorkspaceNotFoundException()

    if (workspace.status !== WorkspaceStatus.ACTIVE)
      throw new WorkspaceNotActiveException(workspace.status)

    if (!team) throw new TeamNotFoundException()

    if (!team.isActive) throw new TeamInactiveException()

    const members =
      await this.teamMemberQueryRepository.findByWorkspaceIdAndTeamId({
        workspaceId,
        teamId: team.id,
      })

    return { members }
  }
}
