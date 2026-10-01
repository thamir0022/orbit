import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common'

import {
  CreateProjectRequest,
  CreateProjectResponse,
  GetProjectResponse,
  GetProjectsQuery,
  GetProjectsResponse,
} from '../dtos'

import {
  GET_PROJECTS_USE_CASE,
  type IGetProjectsUseCase,
} from '../../application/usecases/get-projects/get-projects.interface'

import {
  CREATE_PROJECT_USE_CASE,
  ICreateProjectUseCase,
} from '../../application/usecases/create-project'

import { CurrentAuth } from '@/shared/presentation/decorators/current-auth.decorator'
import { AuthContext } from '@/shared/domain/types'
import { ResponseMessage } from '@/shared/presentation/decorators/response-message.decorator'
import { ProjectResponseMessage } from '../enums/response-messages.enum'
import {
  GET_PROJECT_USE_CASE,
  IGetProjectUseCase,
} from '../../application/usecases/get-project'

@Controller('projects')
export class ProjectController {
  constructor(
    @Inject(CREATE_PROJECT_USE_CASE)
    private readonly createProjectUseCase: ICreateProjectUseCase,

    @Inject(GET_PROJECTS_USE_CASE)
    private readonly getProjectsUseCase: IGetProjectsUseCase,

    @Inject(GET_PROJECT_USE_CASE)
    private readonly getProjectUseCase: IGetProjectUseCase
  ) {}

  @Post('')
  @ResponseMessage(ProjectResponseMessage.PROJECT_CREATED)
  async createProject(
    @CurrentAuth() auth: AuthContext,
    @Body() request: CreateProjectRequest
  ): Promise<CreateProjectResponse> {
    const {
      name,
      description,
      avatarUrl,
      leadId,
      priority,
      startDate,
      targetEndDate,
      type,
    } = request

    return this.createProjectUseCase.execute({
      workspaceId: auth.workspaceId!,
      name,
      description,
      avatarUrl,
      priority,
      startDate,
      type,
      targetEndDate,
      leadId,
      actorId: auth.userId,
    })
  }

  @Get('')
  @ResponseMessage(ProjectResponseMessage.PROJECTS_FETCHED)
  async getProjects(
    @CurrentAuth('workspaceId') workspaceId: string,
    @Query() query: GetProjectsQuery
  ): Promise<GetProjectsResponse> {
    const {
      type,
      types,
      stage,
      stages,
      priority,
      priorities,
      status,
      statuses,
      leadId,
      search,
      startDateFrom,
      startDateTo,
      targetEndDateFrom,
      targetEndDateTo,
      page,
      limit,
      sortField,
      sortOrder,
    } = query

    return this.getProjectsUseCase.execute({
      workspaceId,

      type,
      types,

      stage,
      stages,

      priority,
      priorities,

      status,
      statuses,

      leadId,

      search,

      startDateFrom,
      startDateTo,

      targetEndDateFrom,
      targetEndDateTo,

      page,
      limit,

      sortField,
      sortOrder,
    })
  }

  @Get(':projectId')
  @ResponseMessage(ProjectResponseMessage.PROJECT_FETCHED)
  async getProject(
    @CurrentAuth('workspaceId') workspaceId: string,
    @Param('projectId', new ParseUUIDPipe({ version: '7' })) projectId: string
  ): Promise<GetProjectResponse> {
    return this.getProjectUseCase.execute({
      workspaceId,
      projectId,
    })
  }
}
