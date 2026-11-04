/** Business entities that can reference workspace-owned files. */
export enum AttachmentTargetType {
  WORK_ITEM = 'work_item',
  PROJECT = 'project',
  COMMENT = 'comment',
  DOCUMENT = 'document',
  TEAM = 'team',
  SPRINT = 'sprint',
}

/** How an attachment is presented by its owning feature. */
export enum AttachmentPlacement {
  ATTACHMENT = 'attachment',
  INLINE = 'inline',
}
