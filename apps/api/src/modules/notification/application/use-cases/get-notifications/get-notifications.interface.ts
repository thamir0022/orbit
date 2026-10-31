import type { NotificationPageOutput } from '../../contracts/notification-list-item.output'
import type { GetNotificationsInput } from './get-notifications.input'

/** Application contract for retrieving a paginated notification inbox. */
export interface IGetNotificationsUseCase {
  execute(input: GetNotificationsInput): Promise<NotificationPageOutput>
}

/** Injection token for the notification listing use case. */
export const GET_NOTIFICATIONS_USE_CASE = Symbol('GetNotificationsUseCase')
