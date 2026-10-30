import {
  SprintSummaryResponse,
  SprintWorkItemsResponse,
  SprintScopeResponse,
} from '../dtos/responses/sprint-management.response'
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiOperation, ApiTags, ApiOkResponse } from '@nestjs/swagger'
import { CurrentAuth } from '@/shared/presentation/decorators/current-auth.decorator'
import { AuthContext } from '@/shared/domain/types'
import { SprintAccessGuard } from '../guards/sprint-access.guard'
import { SprintTeamRequest } from '../dtos/requests/sprint-team.request'
import {
  SprintReasonRequest,
  GetSprintWorkItemsQuery,
} from '../dtos/requests/sprint-management.request'
import {
  MANAGE_SPRINT_SCOPE,
  IManageSprintScopeUseCase,
} from '../../../application/usecases/manage-sprint-scope'
import {
  GET_SPRINT_WORK_ITEMS,
  IGetSprintWorkItemsUseCase,
} from '../../../application/usecases/get-sprint-work-items'
import {
  GET_SPRINT_SUMMARY,
  IGetSprintSummaryUseCase,
} from '../../../application/usecases/get-sprint-summary'
import {
  DELETE_SPRINT,
  IDeleteSprintUseCase,
} from '../../../application/usecases/delete-sprint'

/** Defines sprint scope controller behavior for the owning module.
 * Exposes
 * - Sprint scope
 * - Immutable summaries
 * - Planned-sprint deletion.
 */

@ApiTags('Sprints')
@UseGuards(SprintAccessGuard)
@Controller('sprints')
export class SprintScopeController {
  constructor(
    @Inject(MANAGE_SPRINT_SCOPE)
    private readonly manageScope: IManageSprintScopeUseCase,
    @Inject(GET_SPRINT_WORK_ITEMS)
    private readonly list: IGetSprintWorkItemsUseCase,
    @Inject(GET_SPRINT_SUMMARY)
    private readonly summary: IGetSprintSummaryUseCase,
    @Inject(DELETE_SPRINT) private readonly remove: IDeleteSprintUseCase
  ) {}

  @Get(':sprintId/summary')
  @ApiOperation({
    summary: 'Read sprint commitments, outcomes, and live progress',
  })
  @ApiOkResponse({ type: SprintSummaryResponse })
  getSummary(
    @CurrentAuth() auth: AuthContext,
    @Param('sprintId', new ParseUUIDPipe({ version: '7' })) sprintId: string,
    @Query() query: SprintTeamRequest
  ) {
    return this.summary.execute({
      workspaceId: auth.workspaceId!,
      actorId: auth.userId,
      sprintId,
      teamId: query.teamId,
    })
  }

  @Get(':sprintId/work-items')
  @ApiOperation({
    summary: 'List assignment episodes, including removed and rolled-over work',
  })
  @ApiOkResponse({ type: SprintWorkItemsResponse })
  getWorkItems(
    @CurrentAuth() auth: AuthContext,
    @Param('sprintId', new ParseUUIDPipe({ version: '7' })) sprintId: string,
    @Query() query: GetSprintWorkItemsQuery
  ) {
    return this.list.execute({
      workspaceId: auth.workspaceId!,
      actorId: auth.userId,
      sprintId,
      teamId: query.teamId,
      page: query.page,
      limit: query.limit,
    })
  }

  @Put(':sprintId/work-items/:workItemId')
  @ApiOperation({
    summary: 'Assign any work-item type owned by the sprint team',
  })
  @ApiOkResponse({ type: SprintScopeResponse })
  assign(
    @CurrentAuth() auth: AuthContext,
    @Param('sprintId', new ParseUUIDPipe({ version: '7' })) sprintId: string,
    @Param('workItemId', new ParseUUIDPipe({ version: '7' }))
    workItemId: string,
    @Body() body: SprintReasonRequest
  ) {
    return this.manageScope.execute({
      workspaceId: auth.workspaceId!,
      actorId: auth.userId,
      sprintId,
      workItemId,
      teamId: body.teamId,
      reason: body.reason,
      action: 'assign',
    })
  }

  @Delete(':sprintId/work-items/:workItemId')
  @ApiOperation({
    summary: 'Remove a sprint assignment while retaining its history',
  })
  @ApiOkResponse({ type: SprintScopeResponse })
  unassign(
    @CurrentAuth() auth: AuthContext,
    @Param('sprintId', new ParseUUIDPipe({ version: '7' })) sprintId: string,
    @Param('workItemId', new ParseUUIDPipe({ version: '7' }))
    workItemId: string,
    @Query() query: SprintReasonRequest
  ) {
    return this.manageScope.execute({
      workspaceId: auth.workspaceId!,
      actorId: auth.userId,
      sprintId,
      workItemId,
      teamId: query.teamId,
      reason: query.reason,
      action: 'remove',
    })
  }

  @Delete(':sprintId')
  @ApiOperation({
    summary: 'Delete a planned sprint and detach its work items',
  })
  async deleteSprint(
    @CurrentAuth() auth: AuthContext,
    @Param('sprintId', new ParseUUIDPipe({ version: '7' })) sprintId: string,
    @Query() query: SprintTeamRequest
  ) {
    await this.remove.execute({
      workspaceId: auth.workspaceId!,
      actorId: auth.userId,
      sprintId,
      teamId: query.teamId,
    })
    return { deleted: true }
  }
}
