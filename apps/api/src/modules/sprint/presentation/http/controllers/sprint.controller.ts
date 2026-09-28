import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common'
import {
  CREATE_SPRINT_USE_CASE,
  ICreateSprintUseCase,
} from '../../../application/usecases/create-sprint'
import { CurrentAuth } from '@/shared/presentation/decorators/current-auth.decorator'
import { CreateSprintRequest, CreateSprintResponse } from '../dtos'
import { AuthContext } from '@/shared/domain/types'
import {
  GET_SPRINTS_USE_CASE,
  IGetSprintsUseCase,
} from '../../../application/usecases/get-sprints'
import { GetSprintsQuery, GetSprintsResponse } from '../dtos'

@Controller('sprints')
export class SprintController {
  constructor(
    @Inject(CREATE_SPRINT_USE_CASE)
    private readonly createSprintUseCase: ICreateSprintUseCase,
    @Inject(GET_SPRINTS_USE_CASE)
    private readonly getSprintsUseCase: IGetSprintsUseCase
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
}
