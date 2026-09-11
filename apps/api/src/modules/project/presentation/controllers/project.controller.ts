import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
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
import { AccessTokenGuard } from '@/shared/infrastructure/security/guards/access-token.guard'
import { RefreshTokenGuard } from '@/shared/infrastructure/security/guards/refresh-token.guard'
import { CurrentIdentity } from '@/shared/presentation/decorators/current-identity.decorator'
import {
  type AccessTokenPayload,
  type RefreshTokenPayload,
} from '@/shared/domain/types'
import { CurrentTenant } from '@/shared/presentation/decorators/current-tenent.decorator'
import {
  GET_PROJECTS,
  type IGetProjectsUseCase,
} from '../../application/usecases/get-projects.interface'

@Controller('projects')
export class ProjectController {
  constructor(
    @Inject(CREATE_PROJECT)
    private readonly createProjectUseCase: ICreateProjectUseCase,

    @Inject(GET_PROJECTS)
    private readonly getProjectsUseCase: IGetProjectsUseCase
  ) {}

  @Post('')
  @UseGuards(AccessTokenGuard, RefreshTokenGuard)
  async createProject(
    @CurrentIdentity() identity: RefreshTokenPayload,
    @CurrentTenant() tenant: AccessTokenPayload,
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
      workspaceId: tenant.tid!,
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
      createdBy: identity.sub,
    })
  }

  @Get('')
  @UseGuards(AccessTokenGuard, RefreshTokenGuard)
  async getProjects(
    @CurrentTenant() tenant: AccessTokenPayload,
    @Query() query: GetProjectsRequest
  ): Promise<GetProjectsResponse> {
    return this.getProjectsUseCase.execute({
      workspaceId: tenant.tid!,
      name: query.name,
      key: query.key,
      type: query.type,
      priority: query.priority,
      status: query.status,
    })
  }
}
