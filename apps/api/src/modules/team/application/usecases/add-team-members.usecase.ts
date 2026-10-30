import {
  TEAM_ACCESS_SERVICE,
  ITeamAccessService,
} from '../services/team-access.service.interface'
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
  TeamInactiveException,
  TeamNotFoundException,
} from '../../domain/exceptions'
import { TeamMember } from '../../domain/entities/team-member.entity'
import { UserId } from '@/modules/user/domain'

import { TEAM_REPOSITORY, TeamRepository } from '../ports/team-repository.port'

import {
  TEAM_MEMBER_REPOSITORY,
  TeamMemberRepository,
} from '../ports/team-member-repository.port'

import { AddTeamMembersInput, AddTeamMembersOutput } from '../dtos'

import { IAddTeamMembersUseCase } from './add-team-members.interface'

import {
  WorkspaceNotActiveException,
  WorkspaceNotFoundException,
  WorkspaceMemberNotFoundException,
  WorkspaceMemberNotActiveException,
} from '@/modules/workspace/domain/exceptions/workspace.exception'
import {
  TEAM_MEMBER_QUERY_REPOSITORY,
  TeamMemberQueryRepository,
} from '../ports/team-member-query-repository.port'
import { TeamKey } from '../../domain/value-objects/team-key.vo'

/** Validates all requested users, restores removed members, and adds new memberships. */
@Injectable()
export class AddTeamMembersUseCase implements IAddTeamMembersUseCase {
  constructor(
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: ITransactionManager,
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository,

    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly workspaceMemberRepository: IWorkspaceMemberRepository,

    @Inject(TEAM_REPOSITORY)
    private readonly teamRepository: TeamRepository,

    @Inject(TEAM_MEMBER_REPOSITORY)
    private readonly teamMemberRepository: TeamMemberRepository,

    @Inject(TEAM_MEMBER_QUERY_REPOSITORY)
    private readonly teamMemberQueryRepository: TeamMemberQueryRepository,
    @Inject(TEAM_ACCESS_SERVICE) private readonly access: ITeamAccessService
  ) {}

  async execute(input: AddTeamMembersInput): Promise<AddTeamMembersOutput> {
    const workspaceId = WorkspaceId.create(input.workspaceId)
    const key = TeamKey.create(input.teamKey)

    /**
     * Deduplicate user IDs before querying MongoDB.
     */
    const userIds = [...new Set(input.userIds)].map((userId) =>
      UserId.create(userId)
    )

    /**
     * Validate workspace and team in parallel.
     */
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

    // Only the lead can change membership and grant access to sprint scope.
    await this.access.assertLead(team, input.actorId)

    /**
     * Fetch workspace memberships and existing team memberships
     * in parallel to avoid sequential database calls.
     */
    const [workspaceMembers, existingTeamMembers] = await Promise.all([
      this.workspaceMemberRepository.findMembersByWorkspaceIdAndUserIds({
        workspaceId,
        userIds,
      }),

      this.teamMemberRepository.findByWorkspaceIdAndTeamIdAndUserIds({
        workspaceId,
        teamId: team.id,
        userIds,
      }),
    ])

    /**
     * Only active workspace members are eligible
     * to become team members.
     */
    const activeWorkspaceMemberIds = new Set(
      workspaceMembers
        .filter((member) => member.status === WorkspaceMemberStatus.ACTIVE)
        .map((member) => member.userId.value)
    )

    /**
     * Existing team memberships are ignored.
     */
    const existingTeamMemberIds = new Set(
      existingTeamMembers.map((member) => member.userId.value)
    )

    /**
     * Determine which users should actually be added.
     *
     * Conditions:
     * 1. User is an active workspace member
     * 2. User is not already a team member
     */
    const workspaceUserIds = new Set(
      workspaceMembers.map((member) => member.userId.value)
    )
    for (const userId of userIds) {
      if (!workspaceUserIds.has(userId.value))
        throw new WorkspaceMemberNotFoundException()
      if (!activeWorkspaceMemberIds.has(userId.value))
        throw new WorkspaceMemberNotActiveException()
    }

    const membersToAdd = userIds.filter(
      (userId) =>
        activeWorkspaceMemberIds.has(userId.value) &&
        !existingTeamMemberIds.has(userId.value)
    )

    /**
     * Create domain aggregates.
     */
    const teamMembers = membersToAdd.map((userId) =>
      TeamMember.create({
        workspaceId,
        teamId: team.id,
        userId,
        addedBy: UserId.create(input.actorId),
      })
    )

    /**
     * Persist all new memberships in one database operation.
     */
    const membersToRestore = existingTeamMembers.filter((member) =>
      member.isInactive()
    )
    for (const member of membersToRestore) member.restore()
    if (teamMembers.length || membersToRestore.length) {
      await this.transactionManager.executeTransaction(async (session) => {
        await this.teamMemberRepository.saveMany(teamMembers, { session })
        for (const member of membersToRestore) {
          await this.teamMemberRepository.save(member, { session })
        }
      })
    }

    const members =
      await this.teamMemberQueryRepository.findByWorkspaceIdAndTeamId({
        workspaceId,
        teamId: team.id,
      })

    return {
      members,
    }
  }
}
