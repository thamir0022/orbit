import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common'

import {
  CreateProjectRequest,
  CreateProjectResponse,
  GetProjectsRequest,
  GetProjectsResponse,
} from '../dtos'

import {
  GET_PROJECTS,
  type IGetProjectsUseCase,
} from '../../application/usecases/get-projects.interface'

import { CurrentAuth } from '@/shared/presentation/decorators/current-auth.decorator'
import { AuthContext } from '@/shared/domain/types'

import {
  CREATE_PROJECT_USE_CASE,
  ICreateProjectUseCase,
} from '../../application/usecases/create-project'

@Controller('projects')
export class ProjectController {
  constructor(
    @Inject(CREATE_PROJECT_USE_CASE)
    private readonly createProjectUseCase: ICreateProjectUseCase,

    @Inject(GET_PROJECTS)
    private readonly getProjectsUseCase: IGetProjectsUseCase
  ) {}

  @Post('')
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
  async getProjects(
    @CurrentAuth('workspaceId') workspaceId: string,
    @Query() query: GetProjectsRequest
  ): Promise<GetProjectsResponse> {
    return this.getProjectsUseCase.execute({
      workspaceId,
      name: query.name,
      key: query.key,
      type: query.type,
      priority: query.priority,
      status: query.status,
    })
  }
}
