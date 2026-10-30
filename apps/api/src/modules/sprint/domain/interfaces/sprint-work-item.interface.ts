import { SprintAssignmentState } from '../enums/sprint-assignment-state.enum'
import { SprintItemSnapshot } from './sprint-snapshot.interface'

export interface SprintWorkItemProps {
  id: string
  workspaceId: string
  teamId: string
  sprintId: string
  workItemId: string
  state: SprintAssignmentState
  current: boolean
  addedAt: Date
  addedBy: string
  addedDuringActive: boolean
  removedAt: Date | null
  removedBy: string | null
  assignmentReason: string | null
  reason: string | null
  sourceSprintId: string | null
  targetSprintId: string | null
  previousAssignmentId: string | null
  rolloverCount: number
  assignedSnapshot: SprintItemSnapshot
  committedSnapshot: SprintItemSnapshot | null
  closedSnapshot: SprintItemSnapshot | null
}
