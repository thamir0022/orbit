import {
  Attachment,
  AttachmentId,
  AttachmentTarget,
  FileId,
} from '@/modules/file/domain'
import { WorkspaceId } from '@/modules/workspace/domain'
import { RepositorySnapshot } from './repository-snapshot'

/** Read window for displaying active attachments in a target. */
export interface AttachmentPageQuery {
  readonly workspaceId: WorkspaceId
  readonly target: AttachmentTarget
  readonly limit: number
}

/** Attachment links remain independent from the underlying File lifecycle. */
export interface AttachmentRepository {
  findById(id: AttachmentId): Promise<RepositorySnapshot<Attachment> | null>
  findActiveByTarget(
    query: AttachmentPageQuery
  ): Promise<ReadonlyArray<RepositorySnapshot<Attachment>>>
  hasActiveReferences(fileId: FileId): Promise<boolean>
  findActiveLink(
    query: Omit<AttachmentPageQuery, 'limit'> & { readonly fileId: FileId }
  ): Promise<RepositorySnapshot<Attachment> | null>
  nextPosition(query: Omit<AttachmentPageQuery, 'limit'>): Promise<number>
  insert(attachment: Attachment): Promise<void>
  update(attachment: Attachment, expectedRevision: number): Promise<number>
}

export const ATTACHMENT_REPOSITORY = Symbol('IAttachmentRepository')
