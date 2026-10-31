import { NotificationResourceType } from '../../domain/enums/notification-resource-type.enum'
import { NotificationResource } from '../../domain/value-objects/notification-resource.vo'
import type { NotificationResourceProps } from '../../domain/value-objects/notification-resource.vo'

const RESOURCE_SEGMENTS: Record<NotificationResourceType, string> = {
  [NotificationResourceType.WORK_ITEM]: 'work-item',
  [NotificationResourceType.PROJECT]: 'project',
  [NotificationResourceType.TEAM]: 'team',
  [NotificationResourceType.SPRINT]: 'sprint',
  [NotificationResourceType.DOCUMENT]: 'document',
}

/**
 * Creates a permanent internal path for an Orbit resource.
 *
 * - Stable IDs are resolved to current workspace slugs at navigation time.
 * - The /r route must verify user permissions before redirecting.
 */
export function buildNotificationResourceHref(
  resource: NotificationResourceProps
): string {
  const reference = NotificationResource.create(resource)

  return `/r/${RESOURCE_SEGMENTS[reference.type]}/${reference.id}`
}

/**
 * Creates an inline Markdown link at the chosen position in a notification message.
 *
 * - The resource field remains the primary click target for the inbox item.
 * - Call this from a notification content factory wherever a link is needed.
 */
export function buildNotificationResourceMarkdownLink(
  resource: NotificationResourceProps,
  label: string = resource.label ?? 'View resource'
): string {
  const escapedLabel = label
    .normalize('NFKC')
    .replace(/[\r\n\t]+/g, ' ')
    .replaceAll('\\', '\\\\')
    .replaceAll('[', '\\[')
    .replaceAll(']', '\\]')

  return `[${escapedLabel}](${buildNotificationResourceHref(resource)})`
}
