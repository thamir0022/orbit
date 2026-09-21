import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common'
import {
  CREATE_PROJECT,
  type ICreateProjectUseCase,
} from '../../application/usecases/create-project.interface'
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

@Controller('projects')
export class ProjectController {
  constructor(
    @Inject(CREATE_PROJECT)
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
      key,
      description,
      avatarUrl,
      leadId,
      priority,
      resources,
      startDate,
      targetEndDate,
      type,
    } = request
    return this.createProjectUseCase.execute({
      workspaceId: auth.workspaceId!,
      name,
      key,
      description,
      avatarUrl,
      priority,
      resources,
      startDate,
      type,
      targetEndDate,
      leadId,
      createdBy: auth.userId,
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
