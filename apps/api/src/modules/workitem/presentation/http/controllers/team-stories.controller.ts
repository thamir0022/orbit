import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { AuthContext } from '@/shared/domain/types'
import { ResponseMessage } from '@/shared/presentation/decorators/response-message.decorator'
import { WorkItemResponseMessage } from '../enums/response-message.enum'
import { CreateTeamStoryRequest } from '../dtos/requests/create-team-story.request'
import { UpdateTeamStoryRequest } from '../dtos/requests/update-team-story.request'
import { CreateWorkItemResponse, UpdateWorkItemResponse } from '../dtos'
import {
  CREATE_TEAM_STORY_USE_CASE,
  ICreateTeamStoryUseCase,
} from '../../../application/usecases/create-team-story'
import {
  UPDATE_TEAM_STORY_USE_CASE,
  IUpdateTeamStoryUseCase,
} from '../../../application/usecases/update-team-story'
import {
  DELETE_TEAM_STORY_USE_CASE,
  IDeleteTeamStoryUseCase,
} from '../../../application/usecases/delete-team-story'

import {
  GET_TEAM_STORIES_USE_CASE,
  IGetTeamStoriesUseCase,
} from '../../../application/usecases/get-team-stories'
import { GetTeamStoriesQuery } from '../dtos/requests/get-team-stories.query'
import { CurrentAuth } from '@/shared/presentation/decorators/current-auth.decorator'

@Controller('teams/:teamKey')
export class TeamStoriesController {
  constructor(
    @Inject(GET_TEAM_STORIES_USE_CASE)
    private readonly getTeamStoriesUseCase: IGetTeamStoriesUseCase,
    @Inject(CREATE_TEAM_STORY_USE_CASE)
    private readonly createTeamStoryUseCase: ICreateTeamStoryUseCase,
    @Inject(UPDATE_TEAM_STORY_USE_CASE)
    private readonly updateTeamStoryUseCase: IUpdateTeamStoryUseCase,
    @Inject(DELETE_TEAM_STORY_USE_CASE)
    private readonly deleteTeamStoryUseCase: IDeleteTeamStoryUseCase
  ) {}

  @Post('stories')
  @ResponseMessage(WorkItemResponseMessage.WORKITEM_CREATED)
  createStory(
    @CurrentAuth() auth: AuthContext,
    @Param('teamKey') teamKey: string,
    @Body() request: CreateTeamStoryRequest
  ): Promise<CreateWorkItemResponse> {
    return this.createTeamStoryUseCase.execute({
      ...request,
      workspaceId: auth.workspaceId!,
      actorId: auth.userId,
      teamKey,
    })
  }

  @Patch('stories/:key')
  @ResponseMessage(WorkItemResponseMessage.WORKITEM_UPDATED)
  updateStory(
    @CurrentAuth() auth: AuthContext,
    @Param('teamKey') teamKey: string,
    @Param('key') key: string,
    @Body() request: UpdateTeamStoryRequest
  ): Promise<UpdateWorkItemResponse> {
    return this.updateTeamStoryUseCase.execute({
      ...request,
      workspaceId: auth.workspaceId!,
      actorId: auth.userId,
      teamKey,
      key,
    })
  }

  @Delete('stories/:key')
  @ResponseMessage(WorkItemResponseMessage.WORKITEM_DELETED)
  deleteStory(
    @CurrentAuth() auth: AuthContext,
    @Param('teamKey') teamKey: string,
    @Param('key') key: string
  ): Promise<void> {
    return this.deleteTeamStoryUseCase.execute({
      workspaceId: auth.workspaceId!,
      actorId: auth.userId,
      teamKey,
      key,
    })
  }

  @Get('stories')
  execute(
    @CurrentAuth('workspaceId') workspaceId: string,
    @Param('teamKey') teamKey: string,
    @Query() query: GetTeamStoriesQuery
  ) {
    return this.getTeamStoriesUseCase.execute({
      workspaceId,
      teamKey,
      ...query,
    })
  }
}
