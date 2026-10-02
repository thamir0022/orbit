import { UpdateWorkItemProps } from '../../../domain/interfaces/work-item.interface'

/**
 * Input for updating a work item within a workspace.
 *
 * The workspace and work item key identify the target aggregate.
 * Update fields remain optional to support partial updates.
 */
export interface UpdateWorkItemInput extends UpdateWorkItemProps {
  readonly workspaceId: string

  readonly key: string
}
