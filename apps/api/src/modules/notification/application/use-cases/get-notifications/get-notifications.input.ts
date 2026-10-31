/**
 * Input for retrieving an authenticated user's notification inbox.
 *
 * Recipient identity is supplied by the authentication context.
 */
export interface GetNotificationsInput {
  readonly recipientId: string
  readonly limit?: number
  readonly cursor?: string
  readonly unreadOnly?: boolean
}
