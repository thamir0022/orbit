import { Inject, Injectable } from '@nestjs/common'

import { ITransactionManager, TRANSACTION_MANAGER } from '@/shared/application'

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
import {
  WorkspaceMemberNotActiveException,
  WorkspaceMemberNotFoundException,
  WorkspaceNotActiveException,
  WorkspaceNotFoundException,
} from '@/modules/workspace/domain/exceptions/workspace.exception'
import { UserId } from '@/modules/user/domain'

import { Team } from '../../domain/entities/team.entity'
import { TeamMember } from '../../domain/entities/team-member.entity'
import {
  TeamAlreadyExistsException,
  TeamLeadNotActiveWorkspaceMemberException,
  TeamLeadNotWorkspaceMemberException,
  TeamNotFoundException,
} from '../../domain/exceptions'

import {
  TEAM_MEMBER_REPOSITORY,
  TeamMemberRepository,
} from '../ports/team-member-repository.port'
import {
  TEAM_QUERY_REPOSITORY,
  TeamQueryRepository,
} from '../ports/team-query-repository.port'
import { TEAM_REPOSITORY, TeamRepository } from '../ports/team-repository.port'

import { type CreateTeamInput, type CreateTeamOutput } from '../dtos'
import { ICreateTeamUseCase } from './create-team.interface'

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
    const actorId = UserId.create(input.actorId)
    const leadId = input.leadId ? UserId.create(input.leadId) : null

    /**
     * Validate workspace state.
     */
    const workspace = await this.workspaceRepository.findById(workspaceId)

    if (!workspace) {
      throw new WorkspaceNotFoundException()
    }

    if (workspace.status !== WorkspaceStatus.ACTIVE) {
      throw new WorkspaceNotActiveException(workspace.status)
    }

    /**
     * Early duplicate check.
     *
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
     * Merge lead + requested members so the workspace membership
     * validation only requires a single bulk query.
     */
    const requestedUserIds = [
      ...new Set([
        ...(input.memberIds ?? []),
        ...(input.leadId ? [input.leadId] : []),
      ]),
    ].map((userId) => UserId.create(userId))

    const workspaceMembers =
      requestedUserIds.length > 0
        ? await this.workspaceMemberRepository.findMembersByWorkspaceIdAndUserIds(
            {
              workspaceId,
              userIds: requestedUserIds,
            }
          )
        : []

    const workspaceMemberMap = new Map(
      workspaceMembers.map((member) => [member.userId.value, member])
    )

    /**
     * Validate the lead explicitly because the lead has
     * dedicated business rules and error semantics.
     */
    if (leadId) {
      const leadMember = workspaceMemberMap.get(leadId.value)

      if (!leadMember) {
        throw new TeamLeadNotWorkspaceMemberException()
      }

      if (leadMember.status !== WorkspaceMemberStatus.ACTIVE) {
        throw new TeamLeadNotActiveWorkspaceMemberException()
      }
    }

    /**
     * Validate every explicitly requested team member.
     * All requested members must be existing active
     * workspace members.
     */
    for (const userId of input.memberIds ?? []) {
      const member = workspaceMemberMap.get(userId)

      if (!member) {
        throw new WorkspaceMemberNotFoundException()
      }

      if (member.status !== WorkspaceMemberStatus.ACTIVE) {
        throw new WorkspaceMemberNotActiveException()
      }
    }

    /**
     * Create the team and its initial memberships atomically.
     */
    const team = await this.transactionManager.executeTransaction(
      async (session) => {
        const newTeam = Team.create({
          workspaceId: workspaceId.value,
          name: input.name,
          description: input.description,
          avatarUrl: input.avatarUrl,
          leadId: leadId?.value,
          createdBy: actorId.value,
        })

        await this.teamRepository.save(newTeam, {
          session,
        })

        /**
         * Create unique memberships from the requested users.
         * The lead is automatically included as a member.
         */
        if (requestedUserIds.length > 0) {
          const teamMembers = requestedUserIds.map((userId) =>
            TeamMember.create({
              workspaceId,
              teamId: newTeam.id,
              userId,
              addedBy: actorId,
            })
          )

          await this.teamMemberRepository.saveMany(teamMembers, { session })
        }

        return newTeam
      }
    )

    /**
     * Read the committed aggregate through the optimized
     * query repository so the response contains the
     * client-facing projection.
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
