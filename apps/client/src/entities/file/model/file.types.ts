/** Business entities that can own file attachments. */
export type AttachmentTargetType =
  'project' | 'work_item' | 'comment' | 'document' | 'team' | 'sprint'

export type FileUploadPurpose = 'attachment' | 'inline'

export type FileLifecycleStatus =
  | 'pending_upload'
  | 'uploaded'
  | 'processing'
  | 'ready'
  | 'rejected'
  | 'failed'
  | 'deleted'

export interface InitiateFileUploadRequest {
  readonly scope: 'workspace'
  readonly purpose: FileUploadPurpose
  readonly originalName: string
  readonly mimeType: string
  readonly sizeBytes: number
  readonly targetType: AttachmentTargetType
  readonly targetId: string
}

interface FileUploadGrantBase {
  readonly fileId: string
  readonly uploadSessionId: string
  readonly expiresAt: string
  readonly url: string
}

export type InitiateFileUploadResponse = FileUploadGrantBase &
  (
    | {
        readonly method: 'POST'
        readonly fields: Readonly<Record<string, string>>
      }
    | {
        readonly method: 'PUT'
        readonly headers: Readonly<Record<string, string>>
      }
  )

export interface CompleteFileUploadResponse {
  readonly fileId: string
  readonly status: 'processing'
}

export interface FileUploadStatusResponse {
  readonly fileId: string
  readonly uploadStatus: string
  readonly fileStatus: FileLifecycleStatus
  readonly sizeBytes: number | null
  readonly processingStatus?:
    'queued' | 'processing' | 'retrying' | 'failed' | null
}

export interface AttachFileRequest {
  readonly displayName?: string
  readonly fileId: string
  readonly targetType: AttachmentTargetType
  readonly targetId: string
  readonly placement: 'attachment' | 'inline'
}

export interface AttachFileResponse {
  readonly attachmentId: string
  readonly fileId: string
}

/** Local upload state, independent of the server lifecycle. */
export type FileQueueStatus =
  'queued' | 'uploading' | 'processing' | 'attaching' | 'done' | 'error'

/** Tracks which steps have completed to support safe retries. */
export type FileQueueStage = 'new' | 'uploaded' | 'processing' | 'ready'

export interface FileQueueItem {
  readonly displayName: string
  readonly id: string
  readonly file: File
  readonly mimeType: string
  readonly status: FileQueueStatus
  readonly stage: FileQueueStage
  readonly progress: number
  readonly fileId?: string
  readonly uploadSessionId?: string
  readonly error?: string
}

export interface FileAttachmentTarget {
  readonly targetType: AttachmentTargetType
  readonly targetId: string
}
