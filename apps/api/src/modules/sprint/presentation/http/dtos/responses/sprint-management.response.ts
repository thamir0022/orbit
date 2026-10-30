import { ApiProperty } from '@nestjs/swagger'
import { SprintAssignmentState } from '../../../../domain/enums/sprint-assignment-state.enum'

/** Documents sprint assignment history and immutable summary responses. */

export class SprintMetricsResponse {
  @ApiProperty({ minimum: 0 })
  items!: number
  @ApiProperty({ minimum: 0 })
  points!: number
  @ApiProperty({ minimum: 0 })
  unestimatedItems!: number
  @ApiProperty({ type: 'object', additionalProperties: { type: 'integer' } })
  byType!: Record<string, number>
}

export class SprintOutcomeResponse {
  @ApiProperty({ type: () => SprintMetricsResponse })
  scope!: SprintMetricsResponse
  @ApiProperty({ type: () => SprintMetricsResponse })
  completed!: SprintMetricsResponse
  @ApiProperty({ type: () => SprintMetricsResponse })
  rolledOver!: SprintMetricsResponse
  @ApiProperty({ type: () => SprintMetricsResponse })
  cancelled!: SprintMetricsResponse
  @ApiProperty({ type: () => SprintMetricsResponse })
  added!: SprintMetricsResponse
  @ApiProperty({ type: () => SprintMetricsResponse })
  removed!: SprintMetricsResponse
}

export class SprintItemSnapshotResponse {
  @ApiProperty({ type: String })
  id!: string
  @ApiProperty({ type: String })
  key!: string
  @ApiProperty({ type: String })
  title!: string
  @ApiProperty({ type: String })
  type!: string
  @ApiProperty({ type: String })
  status!: string
  @ApiProperty({ type: Number, nullable: true })
  points!: number | null
  @ApiProperty({ type: Boolean })
  deleted!: boolean
}

export class SprintAssignmentResponse {
  @ApiProperty({ type: String, format: 'uuid' })
  id!: string
  @ApiProperty({ type: String, format: 'uuid' })
  workspaceId!: string
  @ApiProperty({ type: String, format: 'uuid' })
  teamId!: string
  @ApiProperty({ type: String, format: 'uuid' })
  sprintId!: string
  @ApiProperty({ type: String, format: 'uuid' })
  workItemId!: string
  @ApiProperty({ type: String, format: 'uuid' })
  addedBy!: string
  @ApiProperty({
    enum: SprintAssignmentState,
  })
  state!: SprintAssignmentState
  @ApiProperty({ type: Boolean })
  current!: boolean
  @ApiProperty({ type: Boolean })
  addedDuringActive!: boolean
  @ApiProperty({ type: String, format: 'date-time' })
  addedAt!: Date
  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  removedAt!: Date | null
  @ApiProperty({ type: String, format: 'uuid', nullable: true })
  removedBy!: string | null
  @ApiProperty({ type: String, format: 'uuid', nullable: true })
  sourceSprintId!: string | null
  @ApiProperty({ type: String, format: 'uuid', nullable: true })
  targetSprintId!: string | null
  @ApiProperty({ type: String, format: 'uuid', nullable: true })
  previousAssignmentId!: string | null
  @ApiProperty({ type: String, nullable: true })
  reason!: string | null
  @ApiProperty({ type: String, nullable: true })
  assignmentReason!: string | null
  @ApiProperty({ minimum: 0 })
  rolloverCount!: number
  @ApiProperty({ type: () => SprintItemSnapshotResponse })
  assignedSnapshot!: SprintItemSnapshotResponse
  @ApiProperty({ type: () => SprintItemSnapshotResponse, nullable: true })
  committedSnapshot!: SprintItemSnapshotResponse | null
  @ApiProperty({ type: () => SprintItemSnapshotResponse, nullable: true })
  closedSnapshot!: SprintItemSnapshotResponse | null
}

export class SprintSummaryResponse {
  @ApiProperty({ type: String, format: 'uuid' })
  sprintId!: string
  @ApiProperty({ type: String })
  status!: string
  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  committedAt!: Date | null
  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  closedAt!: Date | null
  @ApiProperty({ type: () => SprintMetricsResponse, nullable: true })
  commitment!: SprintMetricsResponse | null
  @ApiProperty({ type: () => SprintOutcomeResponse, nullable: true })
  outcome!: SprintOutcomeResponse | null
  @ApiProperty({ type: () => SprintOutcomeResponse, nullable: true })
  live!: SprintOutcomeResponse | null
  @ApiProperty({ type: String, nullable: true })
  startedBy!: string | null
  @ApiProperty({ type: String, nullable: true })
  completedBy!: string | null
  @ApiProperty({ type: String, nullable: true })
  cancelledBy!: string | null
  @ApiProperty({ type: String, nullable: true })
  cancellationReason!: string | null
}

export class SprintWorkItemsResponse {
  @ApiProperty({ type: () => [SprintAssignmentResponse] })
  assignments!: SprintAssignmentResponse[]
  @ApiProperty({ type: Number })
  page!: number
  @ApiProperty({ type: Number })
  limit!: number
  @ApiProperty({ type: Number })
  total!: number
  @ApiProperty({ type: Boolean })
  hasNextPage!: boolean
}

export class SprintScopeResponse {
  @ApiProperty({ type: () => SprintAssignmentResponse, nullable: true })
  assignment!: SprintAssignmentResponse | null
}
