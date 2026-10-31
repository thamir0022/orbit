import type { NotificationResourceProps } from '../value-objects/notification-resource.vo'

/**
 * A navigation action attached to notification metadata.
 *
 * - Exactly one of resource or href must be provided.
 * - Resource references remain valid when workspace slugs change.
 */
export interface NotificationAction {
  readonly label: string
  readonly resource?: NotificationResourceProps
  readonly href?: string
}

/** JSON-compatible custom metadata values. */
export type NotificationMetadataValue =
  | string
  | number
  | boolean
  | null
  | readonly NotificationMetadataValue[]
  | { readonly [key: string]: NotificationMetadataValue }

/**
 * Properties used to construct and persist notification metadata.
 *
 * - Markdown remains the primary notification content.
 * - Actions provide optional structured navigation.
 * - Data supports small future extensions without schema changes.
 */
export interface NotificationMetadataProps {
  readonly version?: 1
  readonly actions?: readonly NotificationAction[]
  readonly data?: Readonly<Record<string, NotificationMetadataValue>>
}
