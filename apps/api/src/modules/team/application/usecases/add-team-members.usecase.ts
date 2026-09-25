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

import {
  TeamInactiveException,
  TeamNotFoundException,
} from '../../domain/exceptions'
import { TeamId } from '../../domain/value-objects/team-id.vo'
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
} from '@/modules/workspace/domain/exceptions/workspace.exception'
import {
  TEAM_MEMBER_QUERY_REPOSITORY,
  TeamMemberQueryRepository,
} from '../ports/team-member-query-repository.port'

@Injectable()
export class AddTeamMembersUseCase implements IAddTeamMembersUseCase {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository,

    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private workspaceMemberRepository: IWorkspaceMemberRepository,

    @Inject(TEAM_REPOSITORY)
    private readonly teamRepository: TeamRepository,

    @Inject(TEAM_MEMBER_REPOSITORY)
    private readonly teamMemberRepository: TeamMemberRepository,

    @Inject(TEAM_MEMBER_QUERY_REPOSITORY)
    private readonly teamMemberQueryRepository: TeamMemberQueryRepository
  ) {}

  async execute(input: AddTeamMembersInput): Promise<AddTeamMembersOutput> {
    const workspaceId = WorkspaceId.create(input.workspaceId)
    const teamId = TeamId.create(input.teamId)

    /**
     * Deduplicate user IDs before querying MongoDB.
     */
    const userIds = [...new Set(input.userIds)].map((userId) =>
      UserId.create(userId)
    )

    if (userIds.length === 0)
      return {
        members: [],
      }

    /**
     * Validate workspace and team in parallel.
     */
    const [workspace, team] = await Promise.all([
      this.workspaceRepository.findById(workspaceId),

      this.teamRepository.findByWorkspaceIdAndId({
        workspaceId,
        teamId,
      }),
    ])

    if (!workspace) throw new WorkspaceNotFoundException()

    if (workspace.status !== WorkspaceStatus.ACTIVE)
      throw new WorkspaceNotActiveException(workspace.status)

    if (!team) throw new TeamNotFoundException()

    if (!team.isActive) throw new TeamInactiveException()

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
        teamId,
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
    const membersToAdd = userIds.filter(
      (userId) =>
        activeWorkspaceMemberIds.has(userId.value) &&
        !existingTeamMemberIds.has(userId.value)
    )

    if (membersToAdd.length === 0)
      return {
        members: [],
      }

    /**
     * Create domain aggregates.
     */
    const teamMembers = membersToAdd.map((userId) =>
      TeamMember.create({
        workspaceId,
        teamId,
        userId,
        addedBy: UserId.create(input.actorId),
      })
    )

    /**
     * Persist all new memberships in one database operation.
     */
    await this.teamMemberRepository.saveMany(teamMembers)

    const members =
      await this.teamMemberQueryRepository.findByWorkspaceIdAndTeamId({
        workspaceId,
        teamId,
      })

    return {
      members,
    }
  }
}
