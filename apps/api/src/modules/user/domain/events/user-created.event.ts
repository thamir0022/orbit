import { DomainEvent } from '../../../../shared/domain/domain-event'

interface UserCreatedEventProps {
  userId: string
  email: string
  firstName: string
  lastName: string
}

/**
 * User Created Domain Event
 * Published when a new user registers successfully
 */
export class UserCreatedEvent extends DomainEvent {
  public readonly userId: string
  public readonly email: string
  public readonly firstName: string
  public readonly lastName: string

  constructor(props: UserCreatedEventProps) {
    super()
    this.userId = props.userId
    this.email = props.email
    this.firstName = props.firstName
    this.lastName = props.lastName
  }

  get eventName(): string {
    return 'user.created'
  }
}
