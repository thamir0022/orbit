import { Inject, Injectable } from '@nestjs/common'
import {
  TEAM_STORY_CONTEXT_SERVICE,
  type ITeamStoryContextService,
} from '../../services/team-story-context.service'
import type { DeleteTeamStoryInput } from './delete-team-story.input'
import type { IDeleteTeamStoryUseCase } from './delete-team-story.interface'
import {
  WORK_ITEM_REPOSITORY,
  type WorkItemRepository,
} from '../../ports/work-item-repository.port'
import { UserId } from '@/modules/user/domain'

@Injectable()
export class DeleteTeamStoryUseCase implements IDeleteTeamStoryUseCase {
  constructor(
    @Inject(TEAM_STORY_CONTEXT_SERVICE)
    private readonly contextService: ITeamStoryContextService,
    @Inject(WORK_ITEM_REPOSITORY)
    private readonly workItemRepository: WorkItemRepository
  ) {}

  async execute(input: DeleteTeamStoryInput): Promise<void> {
    const context = await this.contextService.resolve(input)
    const story = await this.contextService.findStory(context, input.key)
    story.delete(UserId.create(input.actorId))
    await this.workItemRepository.save(story)
  }
}
