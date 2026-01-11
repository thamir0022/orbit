import { DomainEvent } from '../../../../shared/domain/domain-event';

export interface UserSignedInEventProps {
  userId: string;
  email: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

/**
 * Domain Event: User Signed In
 * Published when a user successfully authenticates
 */
export class UserSignedInEvent extends DomainEvent {
  readonly userId: string;
  readonly email: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly timestamp: Date;

  constructor(props: UserSignedInEventProps) {
    super();
    this.userId = props.userId;
    this.email = props.email;
    this.ipAddress = props.ipAddress;
    this.userAgent = props.userAgent;
    this.timestamp = props.timestamp;
  }

  get eventName(): string {
    return 'user.signedin';
  }
}
