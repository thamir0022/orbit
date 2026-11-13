import { httpClient } from '@/shared/api/config/http-client'
import type { AttachmentTargetType } from '../model/file.types'
export type { AttachmentTargetType } from '../model/file.types'

export interface FileAttachment {
  readonly id: string
  readonly fileId: string
  readonly displayName: string | null
  readonly placement: 'attachment' | 'inline'
  readonly createdAt: string
  readonly originalName: string
  readonly position: number
  readonly revision: number
}

export const attachmentKeys = {
  target: (targetType: AttachmentTargetType, targetId: string) =>
    ['files', 'attachments', targetType, targetId] as const,
  list: (
    targetType: AttachmentTargetType,
    targetId: string,
    workspaceId: string | undefined
  ) => [...attachmentKeys.target(targetType, targetId), workspaceId] as const,
}

export function attachmentTitle(attachment: FileAttachment): string {
  return attachment.displayName?.trim() || attachment.originalName
}

export async function renameAttachment(
  attachment: FileAttachment,
  displayName: string
): Promise<void> {
  await httpClient.patch(
    `/files/attachments/${encodeURIComponent(attachment.id)}`,
    { displayName, revision: attachment.revision }
  )
}

export async function deleteAttachment(attachmentId: string): Promise<void> {
  await httpClient.delete(
    `/files/attachments/${encodeURIComponent(attachmentId)}`
  )
}

export async function reorderAttachments(
  targetType: AttachmentTargetType,
  targetId: string,
  attachments: readonly FileAttachment[]
): Promise<void> {
  await httpClient.patch('/files/attachments/order', {
    targetType,
    targetId,
    items: attachments.map(({ id, revision }) => ({ id, revision })),
  })
}

export interface FileAccess {
  readonly url: string
  readonly fileName: string
  readonly mimeType: string
  readonly expiresAt: string
}

/** Returns attachments linked to a business resource. */
export async function getAttachments(
  targetType: AttachmentTargetType,
  targetId: string
): Promise<readonly FileAttachment[]> {
  const params = new URLSearchParams({
    targetType,
    targetId,
    limit: '100',
  })

  const response = await httpClient.get<readonly FileAttachment[]>(
    `/files/attachments?${params}`
  )

  return response.data
}

/** Creates a temporary, authorized URL for an inline preview. */
export async function getFilePreview(
  fileId: string,
  attachmentId: string
): Promise<FileAccess> {
  const params = new URLSearchParams({
    attachmentId,
    disposition: 'inline',
  })

  const response = await httpClient.get<FileAccess>(
    `/files/${encodeURIComponent(fileId)}/access?${params}`
  )

  return response.data
}
