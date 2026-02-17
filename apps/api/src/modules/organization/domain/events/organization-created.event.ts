import { DomainEvent } from '@/shared/domain'

interface OrganizationCreatedEventProps {
  organizationId: string
  name: string
  ownerId: string
}

/**
 * Organization Created Domain Event
 * Published when a new organization is successfully created
 */
export class OrganizationCreatedEvent extends DomainEvent {
  public readonly organizationId: string
  public readonly name: string
  public readonly ownerId: string

  constructor(props: OrganizationCreatedEventProps) {
    super()
    this.organizationId = props.organizationId
    this.name = props.name
    this.ownerId = props.ownerId
  }

  get eventName(): string {
    return 'organization.created'
  }
}
