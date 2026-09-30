import {
  CREATE_WORK_ITEM_USE_CASE,
  ICreateWorkItemUseCase,
} from '@/modules/workitem/application/usecases/create-work-item'
import { Body, Controller, Inject, Post } from '@nestjs/common'
import { CreateWorkItemRequest, CreateWorkItemResponse } from '../dtos'
import { CurrentAuth } from '@/shared/presentation/decorators/current-auth.decorator'
import { AuthContext } from '@/shared/domain/types'

@Controller('work-items')
export class WorkItemController {
  constructor(
    @Inject(CREATE_WORK_ITEM_USE_CASE)
    private readonly createWorkItemUseCase: ICreateWorkItemUseCase
  ) {}

  @Post()
  async createWorkItem(
    @CurrentAuth() auth: AuthContext,
    @Body() req: CreateWorkItemRequest
  ): Promise<CreateWorkItemResponse> {
    const {
      projectId,
      teamId,
      sprintId,
      title,
      description,
      type,
      priority,
      acceptanceCriteria,
      assigneeId,
      storyPoints,
      parentId,
      startedAt,
      dueDate,
    } = req

    return this.createWorkItemUseCase.execute({
      workspaceId: auth.workspaceId!,
      projectId,
      teamId,
      sprintId,
      title,
      description,
      type,
      priority,
      acceptanceCriteria,
      assigneeId,
      storyPoints,
      parentId,
      startedAt,
      dueDate,
      actorId: auth.userId,
    })
  }
}
