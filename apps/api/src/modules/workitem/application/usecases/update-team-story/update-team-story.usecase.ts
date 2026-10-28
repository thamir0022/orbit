import { Inject, Injectable } from '@nestjs/common'
import {
  TEAM_STORY_CONTEXT_SERVICE,
  type ITeamStoryContextService,
} from '../../services/team-story-context.service'
import type { UpdateTeamStoryInput } from './update-team-story.input'
import type { IUpdateTeamStoryUseCase } from './update-team-story.interface'
import {
  WORK_ITEM_REPOSITORY,
  type WorkItemRepository,
} from '../../ports/work-item-repository.port'
import {
  WORK_ITEM_QUERY_REPOSITORY,
  type WorkItemQueryRepository,
} from '../../ports/work-item-query-repository.port'
import type { UpdateWorkItemOutput } from '../update-workitem/update-workitem.output'
import { WorkItemNotFoundException } from '../../../domain/exceptions'

@Injectable()
export class UpdateTeamStoryUseCase implements IUpdateTeamStoryUseCase {
  constructor(
    @Inject(TEAM_STORY_CONTEXT_SERVICE)
    private readonly contextService: ITeamStoryContextService,
    @Inject(WORK_ITEM_REPOSITORY)
    private readonly workItemRepository: WorkItemRepository,
    @Inject(WORK_ITEM_QUERY_REPOSITORY)
    private readonly workItemQueryRepository: WorkItemQueryRepository
  ) {}

  async execute(input: UpdateTeamStoryInput): Promise<UpdateWorkItemOutput> {
    const context = await this.contextService.resolve(input)
    const story = await this.contextService.findStory(context, input.key)
    const props = {
      title: input.title,
      description: input.description,
      acceptanceCriteria: input.acceptanceCriteria,
      parentId: input.parentId,
      status: input.status,
      priority: input.priority,
      assigneeId: input.assigneeId,
      storyPoints: input.storyPoints,
      startedAt: input.startedAt,
      dueDate: input.dueDate,
      completedAt: input.completedAt,
    }
    await this.contextService.validateReferences(context, {
      projectId: story.projectId?.value,
      parentId: props.parentId,
      assigneeId: props.assigneeId,
    })
    story.updateWorkItem(props)
    await this.workItemRepository.save(story)
    const workItem =
      await this.workItemQueryRepository.findByWorkspaceIdAndTeamIdAndId({
        workspaceId: context.workspaceId,
        teamId: context.team.id,
        workItemId: story.id,
      })
    if (!workItem) throw new WorkItemNotFoundException()
    return { workItem }
  }
}
