import type { FileMediaType, StorageObjectRef } from '@/modules/file/domain'

/** Explicit unsafe-content rejection (not an I/O outage eligible for blind retry). */
export class FileContentRejectedError extends Error {
  constructor(
    message = 'File content does not match the allowed upload format'
  ) {
    super(message)
    this.name = FileContentRejectedError.name
  }
}

/** Trusted, independently inspected object metadata. */
export interface VerifiedFileContent {
  readonly sizeBytes: number
  readonly sha256: string
  readonly mimeType: string
  readonly mediaType: FileMediaType
}

/** Stream inspection must enforce size, check a real content signature, and hash all bytes. */
export interface FileContentInspectorPort {
  inspect(input: {
    object: StorageObjectRef
    expectedEtag: string
    expectedBytes: number
    declaredMimeType: string
  }): Promise<VerifiedFileContent>
}

export const FILE_CONTENT_INSPECTOR = Symbol('IFileContentInspector')
