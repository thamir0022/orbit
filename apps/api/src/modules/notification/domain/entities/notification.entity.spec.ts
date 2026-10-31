import { UuidUtil } from '@/shared/utils'
import { Notification } from './notification.entity'
import { NotificationType } from '../enums/notification-type.enum'
import { NotificationResourceType } from '../enums/notification-resource-type.enum'
import { NotificationValidationException } from '../exceptions/notification-validation.exception'

/**
 * Domain tests for the notification aggregate.
 *
 * - Covers read transitions, stable references, and onboarding retention.
 */
describe('Notification', () => {
  /** Creates a standard application notification for tests. */
  function createNotification() {
    return Notification.create({
      eventId: UuidUtil.generate(),
      recipientId: UuidUtil.generate(),
      workspaceId: UuidUtil.generate(),
      type: NotificationType.WORK_ITEM_ASSIGNED,
      title: 'Work item assigned',
      message: 'You were assigned to **ORB-123**',
      resource: {
        type: NotificationResourceType.WORK_ITEM,
        id: UuidUtil.generate(),
      },
    })
  }

  it('creates an unread notification with stable resource reference and expiration', () => {
    const notification = createNotification()
    expect(notification.isRead).toBe(false)
    expect(notification.resource?.type).toBe(NotificationResourceType.WORK_ITEM)
    expect(notification.expiresAt).toBeInstanceOf(Date)
  })

  it('supports idempotent read and unread transitions', () => {
    const notification = createNotification()
    expect(notification.markRead()).toBe(true)
    expect(notification.markRead()).toBe(false)
    expect(notification.markUnread()).toBe(true)
    expect(notification.markUnread()).toBe(false)
  })

  it('does not expire welcome onboarding messages by default', () => {
    const notification = Notification.create({
      eventId: UuidUtil.generate(),
      recipientId: UuidUtil.generate(),
      type: NotificationType.SYSTEM_WELCOME,
      title: 'Welcome to Orbit',
      message: 'Get started with Orbit.',
      metadata: { videoUrl: 'https://videos.example.com/tutorial' },
    })
    expect(notification.expiresAt).toBeNull()
  })

  it('rejects non-HTTPS media URLs', () => {
    expect(() =>
      Notification.create({
        eventId: UuidUtil.generate(),
        recipientId: UuidUtil.generate(),
        type: NotificationType.SYSTEM_WELCOME,
        title: 'Welcome to Orbit',
        message: 'Get started with Orbit.',
        metadata: { videoUrl: 'javascript:alert(1)' },
      })
    ).toThrow(NotificationValidationException)
  })
})
