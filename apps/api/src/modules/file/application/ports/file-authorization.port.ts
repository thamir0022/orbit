import type {
  Attachment,
  AttachmentTarget,
  File,
  FileScope,
} from '@/modules/file/domain'
import type { FileUploadPurpose } from './file-upload-policy.port'

/** Business-authorization context supplied by the authenticated session. */
export interface FileActor {
  readonly userId: string
  readonly workspaceId: string | null
}

/** Authorization must resolve business ownership, privacy and membership, not just workspace equality. */
export interface FileAuthorizationPort {
  assertCanManageAttachments(input: {
    actor: FileActor
    target: AttachmentTarget
  }): Promise<void>
  assertCanUpload(input: {
    actor: FileActor
    scope: FileScope
    purpose: FileUploadPurpose
    target: AttachmentTarget | null
  }): Promise<void>

  /** Recheck current membership and permission after bytes arrive; upload grants may outlive role changes. */
  assertCanCompleteUpload(input: {
    actor: FileActor
    file: File
  }): Promise<void>

  /** Verify target visibility and mutation permission before attaching a ready file. */
  assertCanAttach(input: {
    actor: FileActor
    file: File
    target: AttachmentTarget
  }): Promise<void>

  /** Verify permission to enumerate links for a workspace target. */
  assertCanListAttachments(input: {
    actor: FileActor
    target: AttachmentTarget
  }): Promise<void>

  /** Verify permission to remove an existing attachment link. */
  assertCanRemoveAttachment(input: {
    actor: FileActor
    attachment: Attachment
  }): Promise<void>

  /** For workspace files, an attachment is mandatory unless a business module authorizes an unlinked reference. */
  assertCanRead(input: {
    actor: FileActor
    file: File
    attachment: Attachment | null
  }): Promise<void>
}

export const FILE_AUTHORIZATION = Symbol('IFileAuthorization')
