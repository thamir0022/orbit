import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common'

import { CurrentAuth } from '@/shared/presentation/decorators/current-auth.decorator'
import { AuthContext } from '@/shared/domain/types'
import { ResponseMessage } from '@/shared/presentation/decorators/response-message.decorator'
import { WorkItemResponseMessage } from '../enums/response-message.enum'

import {
  CreateWorkItemRequest,
  CreateWorkItemResponse,
  GetWorkItemRequest,
  GetWorkItemResponse,
  GetWorkItemsQuery,
  GetWorkItemsResponse,
} from '../dtos'

import {
  CREATE_WORK_ITEM_USE_CASE,
  ICreateWorkItemUseCase,
} from '../../../application/usecases/create-work-item'

import {
  GET_WORK_ITEMS_USE_CASE,
  IGetWorkItemsUseCase,
} from '../../../application/usecases/get-workitems'

import {
  GET_WORK_ITEM_USE_CASE,
  IGetWorkItemUseCase,
} from '../../../application/usecases/get-workitem'
import {
  DELETE_WORK_ITEM_USE_CASE,
  IDeleteWorkItemUseCase,
} from '../../../application/usecases/delete-workitem'

@Controller('work-items')
export class WorkItemController {
  constructor(
    @Inject(CREATE_WORK_ITEM_USE_CASE)
    private readonly createWorkItemUseCase: ICreateWorkItemUseCase,

    @Inject(GET_WORK_ITEMS_USE_CASE)
    private readonly getWorkItemsUseCase: IGetWorkItemsUseCase,

    @Inject(GET_WORK_ITEM_USE_CASE)
    private readonly getWorkItemUseCase: IGetWorkItemUseCase,

    @Inject(DELETE_WORK_ITEM_USE_CASE)
    private readonly deleteWorkItemUseCase: IDeleteWorkItemUseCase
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

  @Get(':key')
  @ResponseMessage(WorkItemResponseMessage.WORKITEM_FETCHED)
  async getWorkItem(
    @CurrentAuth('workspaceId') workspaceId: string,
    @Param() param: GetWorkItemRequest
  ): Promise<GetWorkItemResponse> {
    return this.getWorkItemUseCase.execute({
      workspaceId,
      key: param.key,
    })
  }

  @Delete(':key')
  @ResponseMessage(WorkItemResponseMessage.WORKITEM_DELETED)
  async deleteWorkItem(
    @CurrentAuth('workspaceId') workspaceId: string,
    @Param('key') key: string
  ) {
    return this.deleteWorkItemUseCase.execute({
      workspaceId,
      key,
    })
  }
}
