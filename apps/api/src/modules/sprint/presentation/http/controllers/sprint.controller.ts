import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import {
  CREATE_SPRINT_USE_CASE,
  ICreateSprintUseCase,
} from '../../../application/usecases/create-sprint'
import { CurrentAuth } from '@/shared/presentation/decorators/current-auth.decorator'
import {
  CreateSprintRequest,
  CreateSprintResponse,
  GetSprintResponse,
  GetSprintsQuery,
  GetSprintsResponse,
  UpdateSprintRequest,
  UpdateSprintResponse,
} from '../dtos'
import { AuthContext } from '@/shared/domain/types'
import {
  GET_SPRINTS_USE_CASE,
  IGetSprintsUseCase,
} from '../../../application/usecases/get-sprints'
import {
  GET_SPRINT_USE_CASE,
  IGetSprintUseCase,
} from '../../../application/usecases/get-sprint'
import {
  IUpdateSprintUseCase,
  UPDATE_SPRINT_USE_CASE,
} from '../../../application/usecases/update-sprint'

@Controller('sprints')
export class SprintController {
  constructor(
    @Inject(CREATE_SPRINT_USE_CASE)
    private readonly createSprintUseCase: ICreateSprintUseCase,
    @Inject(GET_SPRINTS_USE_CASE)
    private readonly getSprintsUseCase: IGetSprintsUseCase,
    @Inject(GET_SPRINT_USE_CASE)
    private readonly getSprintUseCase: IGetSprintUseCase,
    @Inject(UPDATE_SPRINT_USE_CASE)
    private readonly updateSprintUseCase: IUpdateSprintUseCase
  ) {}

  @Post()
  async createSprint(
    @CurrentAuth() auth: AuthContext,
    @Body() req: CreateSprintRequest
  ): Promise<CreateSprintResponse> {
    const { teamId, name, goal, description, startDate, endDate } = req

    return this.createSprintUseCase.execute({
      workspaceId: auth.workspaceId!,
      actorId: auth.userId,
      teamId,
      name,
      goal,
      description,
      startDate,
      endDate,
    })
  }

  @Get()
  async getSprints(
    @CurrentAuth() auth: AuthContext,
    @Query() query: GetSprintsQuery
  ): Promise<GetSprintsResponse> {
    const {
      teamId,
      status,
      statuses,
      startDateFrom,
      startDateTo,
      endDateFrom,
      endDateTo,
      sortField,
      sortOrder,
      search,
      limit,
      page,
    } = query

    return this.getSprintsUseCase.execute({
      workspaceId: auth.workspaceId!,
      teamId,
      status,
      statuses,
      startDateFrom,
      startDateTo,
      endDateFrom,
      endDateTo,
      sortField,
      sortOrder,
      search,
      limit,
      page,
    })
  }

  @Get(':sprintId')
  async getSprint(
    @CurrentAuth() auth: AuthContext,
    @Query('teamId') teamId: string,
    @Param('sprintId') sprintId: string
  ): Promise<GetSprintResponse> {
    return this.getSprintUseCase.execute({
      workspaceId: auth.workspaceId!,
      sprintId,
      teamId,
    })
  }

  @Put(':sprintId')
  async updateSprint(
    @CurrentAuth() auth: AuthContext,
    @Param('sprintId') sprintId: string,
    @Body() req: UpdateSprintRequest
  ): Promise<UpdateSprintResponse> {
    const { teamId, name, goal, description, startDate, endDate } = req

    return this.updateSprintUseCase.execute({
      workspaceId: auth.workspaceId!,
      teamId,
      sprintId,
      name,
      goal,
      description,
      startDate,
      endDate,
    })
  }
}
