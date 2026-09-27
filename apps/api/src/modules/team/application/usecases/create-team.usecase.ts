import { Inject, Injectable } from '@nestjs/common'

import {
  WorkspaceId,
  WorkspaceMemberStatus,
  WorkspaceStatus,
} from '@/modules/workspace/domain'
import {
  IWorkspaceMemberRepository,
  IWorkspaceRepository,
  WORKSPACE_MEMBER_REPOSITORY,
  WORKSPACE_REPOSITORY,
} from '@/modules/workspace/application'
import { UserId } from '@/modules/user/domain'

import { Team } from '../../domain/entities/team.entity'
import { TeamMember } from '../../domain/entities/team-member.entity'
import {
  TeamAlreadyExistsException,
  TeamLeadNotActiveWorkspaceMemberException,
  TeamLeadNotWorkspaceMemberException,
  TeamNotFoundException,
} from '../../domain/exceptions'

import { TeamRepository, TEAM_REPOSITORY } from '../ports/team-repository.port'
import {
  TeamMemberRepository,
  TEAM_MEMBER_REPOSITORY,
} from '../ports/team-member-repository.port'
import {
  TeamQueryRepository,
  TEAM_QUERY_REPOSITORY,
} from '../ports/team-query-repository.port'
import { CreateTeamInput, CreateTeamOutput } from '../dtos'
import { ICreateTeamUseCase } from './create-team.interface'

import { ITransactionManager, TRANSACTION_MANAGER } from '@/shared/application'

import {
  WorkspaceNotActiveException,
  WorkspaceNotFoundException,
} from '@/modules/workspace/domain/exceptions/workspace.exception'

@Injectable()
export class CreateTeamUseCase implements ICreateTeamUseCase {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository,

    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly workspaceMemberRepository: IWorkspaceMemberRepository,

    @Inject(TEAM_REPOSITORY)
    private readonly teamRepository: TeamRepository,

    @Inject(TEAM_MEMBER_REPOSITORY)
    private readonly teamMemberRepository: TeamMemberRepository,

    @Inject(TEAM_QUERY_REPOSITORY)
    private readonly teamQueryRepository: TeamQueryRepository,

    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: ITransactionManager
  ) {}

  async execute(input: CreateTeamInput): Promise<CreateTeamOutput> {
    const workspaceId = WorkspaceId.create(input.workspaceId)

    /**
     * Validate workspace.
     */
    const workspace = await this.workspaceRepository.findById(workspaceId)

    if (!workspace) {
      throw new WorkspaceNotFoundException()
    }

    if (workspace.status !== WorkspaceStatus.ACTIVE) {
      throw new WorkspaceNotActiveException(workspace.status)
    }

    /**
     * Validate team name.
     *
     * This is only an early/friendly check.
     * The database unique index remains the final
     * concurrency guarantee.
     */
    const existingTeam = await this.teamRepository.findByWorkspaceIdAndName({
      workspaceId,
      name: input.name,
    })

    if (existingTeam) {
      throw new TeamAlreadyExistsException(existingTeam.name)
    }

    /**
     * Validate lead before starting the transaction.
     */
    const leadId = input.leadId ? UserId.create(input.leadId) : null

    if (leadId) {
      const workspaceMember = await this.workspaceMemberRepository.findMember({
        workspaceId,
        memberId: leadId,
      })

      if (!workspaceMember) {
        throw new TeamLeadNotWorkspaceMemberException()
      }

      if (workspaceMember.status !== WorkspaceMemberStatus.ACTIVE) {
        throw new TeamLeadNotActiveWorkspaceMemberException()
      }
    }

    /**
     * Create both the Team and the initial TeamMember atomically.
     */
    const team = await this.transactionManager.executeTransaction(
      async (session) => {
        const newTeam = Team.create({
          workspaceId: workspaceId.value,
          name: input.name,
          description: input.description,
          avatarUrl: input.avatarUrl,
          leadId: leadId?.value,
          createdBy: input.actorId,
        })

        await this.teamRepository.save(newTeam, { session })

        /**
         * A team lead is automatically added as
         * the first team member.
         */
        if (leadId) {
          const teamMember = TeamMember.create({
            workspaceId,
            teamId: newTeam.id,
            userId: leadId,
            addedBy: UserId.create(input.actorId),
          })

          await this.teamMemberRepository.save(teamMember, { session })
        }

        return newTeam
      }
    )

    /**
     * Read through the query repository after the
     * transaction has committed.
     */
    const result = await this.teamQueryRepository.findByWorkspaceIdAndId({
      workspaceId,
      teamId: team.id,
    })

    if (!result) {
      throw new TeamNotFoundException()
    }

    return {
      team: result,
    }
  }
}
