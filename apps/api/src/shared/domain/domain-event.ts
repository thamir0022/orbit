/**
 * Domain Event Base Class
 * Events that represent something significant that happened in the domain
 */
export abstract class DomainEvent {
  public readonly occurredOn: Date
  public readonly eventId: string

  constructor() {
    this.occurredOn = new Date()
    this.eventId = crypto.randomUUID()
  }

  abstract get eventName(): string
}
