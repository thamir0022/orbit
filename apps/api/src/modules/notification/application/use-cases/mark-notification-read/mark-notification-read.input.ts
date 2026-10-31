/** Input for marking one recipient-owned notification as read. */
export interface MarkNotificationReadInput {
  readonly notificationId: string
  readonly recipientId: string
}
