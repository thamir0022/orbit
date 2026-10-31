import type { MarkNotificationReadInput } from './mark-notification-read.input'

/** Application contract for marking one notification as read. */
export interface IMarkNotificationReadUseCase {
  execute(input: MarkNotificationReadInput): Promise<void>
}

/** Injection token for the mark-notification-read use case. */
export const MARK_NOTIFICATION_READ_USE_CASE = Symbol(
  'MarkNotificationReadUseCase'
)
