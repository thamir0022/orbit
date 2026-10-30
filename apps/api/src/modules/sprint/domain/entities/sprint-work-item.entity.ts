import { SprintAssignmentState } from '../enums/sprint-assignment-state.enum'
import { SprintValidationException } from '../exceptions/sprint-validation.exception'
import { SprintItemSnapshot } from '../interfaces/sprint-snapshot.interface'
import { SprintWorkItemProps } from '../interfaces/sprint-work-item.interface'

/** Records one assignment episode and its immutable sprint history. */

export class SprintWorkItem {
  private constructor(private readonly props: SprintWorkItemProps) {
    if (
      props.current !== (props.state === SprintAssignmentState.ASSIGNED) ||
      !Number.isSafeInteger(props.rolloverCount) ||
      props.rolloverCount < 0
    )
      throw new SprintValidationException('Invalid sprint assignment state.')
    if (props.assignedSnapshot.id !== props.workItemId)
      throw new SprintValidationException(
        'Assignment snapshot must match its work item.'
      )
  }

  static reconstitute(props: SprintWorkItemProps): SprintWorkItem {
    return new SprintWorkItem(structuredClone(props))
  }

  // Start a new episode rather than overwriting an earlier removal or rollover.
  static assign(
    input: Pick<
      SprintWorkItemProps,
      | 'id'
      | 'workspaceId'
      | 'teamId'
      | 'sprintId'
      | 'addedBy'
      | 'addedDuringActive'
    > & {
      snapshot: SprintItemSnapshot
      at: Date
      previous?: SprintWorkItemProps
      rollover?: boolean
      reason?: string
    }
  ): SprintWorkItem {
    if (
      input.previous &&
      (input.previous.workspaceId !== input.workspaceId ||
        input.previous.teamId !== input.teamId ||
        input.previous.workItemId !== input.snapshot.id)
    )
      throw new SprintValidationException(
        'Assignment history must belong to the same work item and team.'
      )
    if (input.rollover && !input.previous)
      throw new SprintValidationException(
        'Rollover requires a previous assignment.'
      )
    if (input.snapshot.deleted)
      throw new SprintValidationException(
        'Deleted work items cannot be assigned.'
      )
    return new SprintWorkItem({
      id: input.id,
      workspaceId: input.workspaceId,
      teamId: input.teamId,
      sprintId: input.sprintId,
      workItemId: input.snapshot.id,
      state: SprintAssignmentState.ASSIGNED,
      current: true,
      addedAt: new Date(input.at),
      addedBy: input.addedBy,
      addedDuringActive: input.addedDuringActive,
      removedAt: null,
      removedBy: null,
      assignmentReason: input.reason?.trim() || null,
      reason: null,
      sourceSprintId: input.rollover
        ? (input.previous?.sprintId ?? null)
        : null,
      targetSprintId: null,
      previousAssignmentId: input.previous?.id ?? null,
      rolloverCount:
        (input.previous?.rolloverCount ?? 0) + (input.rollover ? 1 : 0),
      assignedSnapshot: structuredClone(input.snapshot),
      committedSnapshot: null,
      closedSnapshot: null,
    })
  }

  // Freeze the estimate and status present when the sprint starts.
  commit(snapshot: SprintItemSnapshot): void {
    if (!this.props.current || this.props.committedSnapshot)
      throw new SprintValidationException(
        'Assignment cannot be committed twice.'
      )
    this.assertSnapshot(snapshot)
    this.props.committedSnapshot = structuredClone(snapshot)
  }

  // Closing an episode releases its current assignment while retaining history.
  close(
    state: Exclude<SprintAssignmentState, SprintAssignmentState.ASSIGNED>,
    actorId: string,
    at: Date,
    snapshot: SprintItemSnapshot,
    reason?: string,
    targetSprintId?: string
  ): void {
    if (!this.props.current)
      throw new SprintValidationException('Assignment is already closed.')
    if (state === SprintAssignmentState.ROLLED_OVER && !targetSprintId)
      throw new SprintValidationException('Rollover requires a target sprint.')
    this.assertSnapshot(snapshot)
    this.props.state = state
    this.props.current = false
    this.props.removedAt = new Date(at)
    this.props.removedBy = actorId
    this.props.reason = reason?.trim() || null
    this.props.targetSprintId = targetSprintId ?? null
    this.props.closedSnapshot = structuredClone(snapshot)
  }

  // Snapshot identity cannot be changed while closing or committing an episode.
  private assertSnapshot(snapshot: SprintItemSnapshot): void {
    if (snapshot.id !== this.props.workItemId)
      throw new SprintValidationException(
        'Snapshot belongs to another work item.'
      )
  }

  toSnapshot(): SprintWorkItemProps {
    return structuredClone(this.props)
  }
}
