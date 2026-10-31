import { Injectable, Logger } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'

import type { ApplicationEventPublisher } from '../../application/events/application-event-publisher.port'

/**
 * NestJS implementation of the application event publisher.
 *
 * - Dispatches in-process application events through EventEmitter2.
 * - Prevents synchronous dispatch failures from breaking business operations.
 * - Asynchronous listener failures are handled by their subscribers.
 */
@Injectable()
export class NestApplicationEventPublisher implements ApplicationEventPublisher {
  private readonly logger = new Logger(NestApplicationEventPublisher.name)

  constructor(private readonly eventEmitter: EventEmitter2) {}

  /** Publishes an application event to registered subscribers. */
  publish<T extends object>(eventName: string, payload: T): void {
    try {
      this.eventEmitter.emit(eventName, payload)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)

      this.logger.error(
        `Failed to publish application event "${eventName}": ${message}`
      )
    }
  }
}
