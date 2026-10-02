import {
  CREATE_WORK_ITEM_USE_CASE,
  ICreateWorkItemUseCase,
} from '@/modules/workitem/application/usecases/create-work-item'
import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common'
import {
  CreateWorkItemRequest,
  CreateWorkItemResponse,
  GetWorkItemsQuery,
  GetWorkItemsResponse,
} from '../dtos'
import { CurrentAuth } from '@/shared/presentation/decorators/current-auth.decorator'
import { AuthContext } from '@/shared/domain/types'
import {
  GET_WORK_ITEMS_USE_CASE,
  IGetWorkItemsUseCase,
} from '../../../application/usecases/get-workitems'
import { ResponseMessage } from '@/shared/presentation/decorators/response-message.decorator'
import { WorkItemResponseMessage } from '../enums/response-message.enum'

@Controller('work-items')
export class WorkItemController {
  constructor(
    @Inject(CREATE_WORK_ITEM_USE_CASE)
    private readonly createWorkItemUseCase: ICreateWorkItemUseCase,

    @Inject(GET_WORK_ITEMS_USE_CASE)
    private readonly getWorkItemsUseCase: IGetWorkItemsUseCase
  ) {}

  @Post()
  @ResponseMessage(WorkItemResponseMessage.WORKITEM_CREATED)
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

  @Get()
  @ResponseMessage(WorkItemResponseMessage.WORKITEMS_FETCHED)
  async getWorkItems(
    @CurrentAuth('workspaceId') workspaceId: string,
    @Query() query: GetWorkItemsQuery
  ): Promise<GetWorkItemsResponse> {
    return this.getWorkItemsUseCase.execute({
      workspaceId,
      ...query,
    })
  }
}
