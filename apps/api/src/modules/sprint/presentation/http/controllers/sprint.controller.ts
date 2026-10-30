import {
  CompleteSprintRequest,
  SprintReasonRequest,
} from '../dtos/requests/sprint-management.request'
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger'
import { SprintAccessGuard } from '../guards/sprint-access.guard'
import { SprintTeamRequest } from '../dtos/requests/sprint-team.request'
import {
  TRANSITION_SPRINT_USE_CASE,
  ITransitionSprintUseCase,
} from '../../../application/usecases/transition-sprint/transition-sprint.interface'
import {
  Body,
  HttpCode,
  ParseUUIDPipe,
  UseGuards,
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

// All sprint routes require a current workspace membership.
@ApiTags('Sprints')
@UseGuards(SprintAccessGuard)
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
    private readonly updateSprintUseCase: IUpdateSprintUseCase,
    @Inject(TRANSITION_SPRINT_USE_CASE)
    private readonly transitionSprintUseCase: ITransitionSprintUseCase
  ) {}

  @Post()
  @ApiCreatedResponse({ type: CreateSprintResponse })
  async createSprint(
    @CurrentAuth() auth: AuthContext,
    @Body() req: CreateSprintRequest
  ): Promise<CreateSprintResponse> {
    const { teamKey, name, goal, description, startDate, endDate } = req

    return this.createSprintUseCase.execute({
      workspaceId: auth.workspaceId!,
      actorId: auth.userId,
      teamKey,
      name,
      goal: goal ?? null,
      description: description ?? null,
      startDate,
      endDate,
    })
  }

  @Get()
  @ApiOkResponse({ type: GetSprintsResponse })
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
  @ApiOkResponse({ type: GetSprintResponse })
  async getSprint(
    @CurrentAuth() auth: AuthContext,
    @Query() query: SprintTeamRequest,
    @Param('sprintId', new ParseUUIDPipe({ version: '7' })) sprintId: string
  ): Promise<GetSprintResponse> {
    return this.getSprintUseCase.execute({
      workspaceId: auth.workspaceId!,
      sprintId,
      teamId: query.teamId,
    })
  }

  @Put(':sprintId')
  @ApiOkResponse({ type: UpdateSprintResponse })
  async updateSprint(
    @CurrentAuth() auth: AuthContext,
    @Param('sprintId', new ParseUUIDPipe({ version: '7' })) sprintId: string,
    @Body() req: UpdateSprintRequest
  ): Promise<UpdateSprintResponse> {
    const { teamId, name, goal, description, startDate, endDate } = req

    return this.updateSprintUseCase.execute({
      actorId: auth.userId,
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

  @Post(':sprintId/start')
  @HttpCode(200)
  @ApiOperation({ summary: 'Start a sprint' })
  @ApiOkResponse({ type: GetSprintResponse })
  async startSprint(
    @CurrentAuth() auth: AuthContext,
    @Param('sprintId', new ParseUUIDPipe({ version: '7' })) sprintId: string,
    @Body() req: SprintTeamRequest
  ): Promise<GetSprintResponse> {
    return this.transitionSprintUseCase.execute({
      workspaceId: auth.workspaceId!,
      actorId: auth.userId,
      teamId: req.teamId,
      sprintId,
      action: 'start',
    })
  }

  @Post(':sprintId/complete')
  @HttpCode(200)
  @ApiOperation({ summary: 'Complete a sprint' })
  @ApiOkResponse({ type: GetSprintResponse })
  async completeSprint(
    @CurrentAuth() auth: AuthContext,
    @Param('sprintId', new ParseUUIDPipe({ version: '7' })) sprintId: string,
    @Body() req: CompleteSprintRequest
  ): Promise<GetSprintResponse> {
    return this.transitionSprintUseCase.execute({
      workspaceId: auth.workspaceId!,
      actorId: auth.userId,
      teamId: req.teamId,
      sprintId,
      action: 'complete',
      targetSprintId: req.targetSprintId,
      reason: req.reason,
    })
  }

  @Post(':sprintId/cancel')
  @HttpCode(200)
  @ApiOperation({ summary: 'Cancel a sprint' })
  @ApiOkResponse({ type: GetSprintResponse })
  async cancelSprint(
    @CurrentAuth() auth: AuthContext,
    @Param('sprintId', new ParseUUIDPipe({ version: '7' })) sprintId: string,
    @Body() req: SprintReasonRequest
  ): Promise<GetSprintResponse> {
    return this.transitionSprintUseCase.execute({
      workspaceId: auth.workspaceId!,
      actorId: auth.userId,
      teamId: req.teamId,
      sprintId,
      action: 'cancel',
      reason: req.reason,
    })
  }
}
