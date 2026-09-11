import { DomainEvent } from '@/shared/domain'

interface WorkspaceCreatedEventProps {
  workspaceId: string
  name: string
  ownerId: string
}

/**
 * Workspace Created Domain Event
 * Published when a new workspace is successfully created
 */
export class WorkspaceCreatedEvent extends DomainEvent {
  public readonly workspaceId: string
  public readonly name: string
  public readonly ownerId: string

  constructor(props: WorkspaceCreatedEventProps) {
    super()
    this.workspaceId = props.workspaceId
    this.name = props.name
    this.ownerId = props.ownerId
  }

  get eventName(): string {
    return 'workspace.created'
  }
}
