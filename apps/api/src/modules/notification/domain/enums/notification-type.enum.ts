/**
 * Identifies the application event represented by a notification.
 *
 * - Types describe business intent, not delivery channels.
 * - New types can be introduced without changing persistence structure.
 */
export enum NotificationType {
  WORK_ITEM_ASSIGNED = 'work_item.assigned',
  USER_MENTIONED = 'user.mentioned',
  TEAM_MEMBER_ADDED = 'team.member_added',
  PROJECT_LEAD_ASSIGNED = 'project.lead_assigned',
  SECURITY_NEW_SIGN_IN = 'security.new_sign_in',
  SECURITY_PASSWORD_CHANGED = 'security.password_changed',
  SYSTEM_WELCOME = 'system.welcome',
}
