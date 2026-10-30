import { Inject, Injectable } from '@nestjs/common'
import {
  SPRINT_CONTEXT_SERVICE,
  ISprintContextService,
} from '../../services/sprint-context.service'
import {
  SPRINT_WORK_ITEM_REPOSITORY,
  SprintWorkItemRepository,
} from '../../ports/sprint-work-item-repository.port'
import { IGetSprintWorkItemsUseCase } from './get-sprint-work-items.interface'
import { GetSprintWorkItemsInput } from './get-sprint-work-items.input'

/** Lists sprint assignment history with stable pagination. */

@Injectable()
export class GetSprintWorkItemsUseCase implements IGetSprintWorkItemsUseCase {
  constructor(
    @Inject(SPRINT_CONTEXT_SERVICE)
    private readonly context: ISprintContextService,
    @Inject(SPRINT_WORK_ITEM_REPOSITORY)
    private readonly assignments: SprintWorkItemRepository
  ) {}
  async execute(input: GetSprintWorkItemsInput) {
    await this.context.resolve(input, 'member', undefined, true)
    const result = await this.assignments.findPage(
      input,
      input.page,
      input.limit
    )
    const start = (input.page - 1) * input.limit
    return {
      assignments: result.items.map((item) => item.toSnapshot()),
      total: result.total,
      page: input.page,
      limit: input.limit,
      hasNextPage: start + input.limit < result.total,
    }
  }
}
