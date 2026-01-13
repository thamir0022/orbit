import { BaseEntity } from '@/shared/domain/base-entity'
import type { DomainEvent } from '@/shared/domain'

/**
 * Aggregate Root - Entry point for aggregate operations
 * Manages domain events for the aggregate
 */
export abstract class AggregateRoot<T> extends BaseEntity<T> {
  private _domainEvents: DomainEvent[] = []

  get domainEvents(): DomainEvent[] {
    return this._domainEvents
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event)
  }

  public clearEvents(): void {
    this._domainEvents = []
  }
}
