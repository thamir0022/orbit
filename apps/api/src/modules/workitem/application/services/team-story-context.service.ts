import { Inject, Injectable } from '@nestjs/common'
import {
  TEAM_REPOSITORY,
  type TeamRepository,
} from '@/modules/team/application/ports/team-repository.port'
import { TeamNotFoundException } from '@/modules/team/domain/exceptions'
import { TeamKey } from '@/modules/team/domain/value-objects/team-key.vo'
import { Team } from '@/modules/team/domain/entities/team.entity'
import { WorkspaceId, WorkspaceMemberStatus } from '@/modules/workspace/domain'
import {
  WORKSPACE_MEMBER_REPOSITORY,
  type IWorkspaceMemberRepository,
} from '@/modules/workspace/application/repository/workspace-member.repository.interface'
import {
  WorkspaceMemberNotFoundException,
  WorkspaceMemberNotActiveException,
} from '@/modules/workspace/domain/exceptions/workspace.exception'
import {
  PROJECT_REPOSITORY,
  type ProjectRepository,
} from '@/modules/project/application/ports/project-repository.port'
import { ProjectId } from '@/modules/project/domain'
import { ProjectNotFoundException } from '@/modules/project/domain/exceptions'
import { UserId } from '@/modules/user/domain'
import {
  WORK_ITEM_REPOSITORY,
  type WorkItemRepository,
} from '../ports/work-item-repository.port'
import { WorkItem } from '../../domain/entities/work-item.entity'
import { WorkItemType } from '../../domain/enums/work-item-type.enum'
import { WorkItemKey } from '../../domain/value-objects/work-item-key.vo'
import { WorkItemId } from '../../domain/value-objects/work-item-id.vo'
import {
  WorkItemNotFoundException,
  WorkItemInvalidParentTypeException,
  WorkItemProjectMismatchException,
} from '../../domain/exceptions'
import { TeamStoryAccessDeniedException } from '../../domain/exceptions/team-story-access-denied.exception'

export interface TeamStoryContextInput {
  readonly workspaceId: string
  readonly teamKey: string
  readonly actorId: string
}

export interface TeamStoryContext {
  readonly workspaceId: WorkspaceId
  readonly team: Team
}

export interface ITeamStoryContextService {
  resolve(input: TeamStoryContextInput): Promise<TeamStoryContext>
  findStory(context: TeamStoryContext, key: string): Promise<WorkItem>
  validateReferences(
    context: TeamStoryContext,
    input: {
      readonly projectId?: string | null
      readonly parentId?: string | null
      readonly assigneeId?: string | null
    }
  ): Promise<void>
}

export const TEAM_STORY_CONTEXT_SERVICE = Symbol('TeamStoryContextService')

@Injectable()
export class TeamStoryContextService implements ITeamStoryContextService {
  constructor(
    @Inject(TEAM_REPOSITORY) private readonly teamRepository: TeamRepository,
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly memberRepository: IWorkspaceMemberRepository,
    @Inject(WORK_ITEM_REPOSITORY)
    private readonly workItemRepository: WorkItemRepository,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository
  ) {}

  async resolve(input: TeamStoryContextInput): Promise<TeamStoryContext> {
    if (!input.workspaceId || !input.actorId)
      throw new TeamStoryAccessDeniedException()
    const workspaceId = WorkspaceId.create(input.workspaceId)
    const member = await this.memberRepository.findMember({
      workspaceId,
      memberId: UserId.create(input.actorId),
    })
    if (member?.status !== WorkspaceMemberStatus.ACTIVE)
      throw new TeamStoryAccessDeniedException()

    const team = await this.teamRepository.findByWorkspaceIdAndKey({
      workspaceId,
      key: TeamKey.create(input.teamKey),
    })
    if (!team) throw new TeamNotFoundException()
    return { workspaceId, team }
  }

  async findStory(context: TeamStoryContext, key: string): Promise<WorkItem> {
    const story = await this.workItemRepository.findByWorkspaceIdAndKey({
      workspaceId: context.workspaceId,
      key: WorkItemKey.create(key).value,
    })
    if (
      !story ||
      !story.teamId.equals(context.team.id) ||
      story.type !== WorkItemType.STORY ||
      story.isDeleted
    ) {
      throw new WorkItemNotFoundException()
    }
    return story
  }

  async validateReferences(
    context: TeamStoryContext,
    input: {
      readonly projectId?: string | null
      readonly parentId?: string | null
      readonly assigneeId?: string | null
    }
  ): Promise<void> {
    const { workspaceId, team } = context
    if (input.projectId) {
      const project = await this.projectRepository.findByWorkspaceIdAndId({
        workspaceId,
        projectId: ProjectId.create(input.projectId),
      })
      if (!project) throw new ProjectNotFoundException()
    }
    if (input.assigneeId) {
      const assignee = await this.memberRepository.findMember({
        workspaceId,
        memberId: UserId.create(input.assigneeId),
      })
      if (!assignee) throw new WorkspaceMemberNotFoundException()
      if (assignee.status !== WorkspaceMemberStatus.ACTIVE)
        throw new WorkspaceMemberNotActiveException()
    }
    if (input.parentId) {
      const parent = await this.workItemRepository.findByWorkspaceIdAndId({
        workspaceId,
        workItemId: WorkItemId.create(input.parentId),
      })
      if (!parent || !parent.teamId.equals(team.id))
        throw new WorkItemNotFoundException()
      if (parent.type !== WorkItemType.EPIC)
        throw new WorkItemInvalidParentTypeException()
      if (parent.projectId?.value !== (input.projectId ?? undefined))
        throw new WorkItemProjectMismatchException()
    }
  }
}
