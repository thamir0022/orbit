import { Inject, Injectable } from '@nestjs/common'
import { RemoveTeamMemberInput } from '../dtos'
import { IRemoveTeamMemberUseCase } from './remove-team-member.interface'
import {
  IWorkspaceRepository,
  WORKSPACE_REPOSITORY,
} from '@/modules/workspace/application'
import {
  TEAM_MEMBER_REPOSITORY,
  TeamMemberRepository,
} from '../ports/team-member-repository.port'
import { WorkspaceId, WorkspaceStatus } from '@/modules/workspace/domain'
import { TEAM_REPOSITORY, TeamRepository } from '../ports/team-repository.port'
import {
  WorkspaceNotActiveException,
  WorkspaceNotFoundException,
} from '@/modules/workspace/domain/exceptions/workspace.exception'
import { TeamId } from '../../domain/value-objects/team-id.vo'
import { UserId } from '@/modules/user/domain'
import {
  TeamInactiveException,
  TeamMemberNotFoundException,
  TeamNotFoundException,
} from '../../domain/exceptions'

@Injectable()
export class RemoveTeamMemberUseCase implements IRemoveTeamMemberUseCase {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository,
    @Inject(TEAM_REPOSITORY)
    private readonly teamRepository: TeamRepository,
    @Inject(TEAM_MEMBER_REPOSITORY)
    private readonly teamMemberRepository: TeamMemberRepository
  ) {}

  async execute(input: RemoveTeamMemberInput): Promise<void> {
    const workspaceId = WorkspaceId.create(input.workspaceId)

    const workspace = await this.workspaceRepository.findById(workspaceId)

    if (!workspace) throw new WorkspaceNotFoundException()

    if (workspace.status !== WorkspaceStatus.ACTIVE)
      throw new WorkspaceNotActiveException(workspace.status)

    const teamId = TeamId.create(input.teamId)
    const memberId = UserId.create(input.memberId)

    const [team, teamMember] = await Promise.all([
      this.teamRepository.findByWorkspaceIdAndId({ workspaceId, teamId }),
      this.teamMemberRepository.findByWorkspaceIdAndTeamIdAndUserId({
        workspaceId,
        teamId,
        userId: memberId,
      }),
    ])

    if (!team) throw new TeamNotFoundException()

    if (!team.isActive) throw new TeamInactiveException()

    if (!teamMember) throw new TeamMemberNotFoundException()

    const actorId = UserId.create(input.actorId)

    teamMember.remove(actorId)

    await this.teamMemberRepository.save(teamMember)
  }
}
