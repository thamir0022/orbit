/**
 * Stable, navigable resources supported by Orbit's resource resolver.
 *
 * - Resource identifiers are UUIDs, never mutable slugs or URLs.
 */
export enum NotificationResourceType {
  WORK_ITEM = 'work_item',
  PROJECT = 'project',
  TEAM = 'team',
  SPRINT = 'sprint',
  DOCUMENT = 'document',
}
