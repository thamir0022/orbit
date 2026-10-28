import { Inject, Injectable } from '@nestjs/common'
import {
  TEAM_STORY_CONTEXT_SERVICE,
  type ITeamStoryContextService,
} from '../../services/team-story-context.service'
import type { CreateTeamStoryInput } from './create-team-story.input'
import type { ICreateTeamStoryUseCase } from './create-team-story.interface'
import {
  CREATE_WORK_ITEM_USE_CASE,
  type ICreateWorkItemUseCase,
} from '../create-work-item'
import type { CreateWorkItemOutput } from '../create-work-item/create-work-item.output'
import { WorkItemType } from '../../../domain/enums/work-item-type.enum'

@Injectable()
export class CreateTeamStoryUseCase implements ICreateTeamStoryUseCase {
  constructor(
    @Inject(TEAM_STORY_CONTEXT_SERVICE)
    private readonly contextService: ITeamStoryContextService,
    @Inject(CREATE_WORK_ITEM_USE_CASE)
    private readonly createWorkItemUseCase: ICreateWorkItemUseCase
  ) {}

  async execute(input: CreateTeamStoryInput): Promise<CreateWorkItemOutput> {
    const { teamKey, ...props } = input
    const context = await this.contextService.resolve({
      workspaceId: input.workspaceId,
      actorId: input.actorId,
      teamKey,
    })
    await this.contextService.validateReferences(context, input)
    return this.createWorkItemUseCase.execute({
      ...props,
      teamId: context.team.id.value,
      type: WorkItemType.STORY,
    })
  }
}
