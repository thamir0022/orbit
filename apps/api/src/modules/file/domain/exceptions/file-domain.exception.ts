/** Stable error codes for file-domain invariant failures. */
export enum FileDomainErrorCode {
  INVALID_ID = 'FILE_INVALID_ID',
  INVALID_NAME = 'FILE_INVALID_NAME',
  INVALID_SIZE = 'FILE_INVALID_SIZE',
  INVALID_MIME_TYPE = 'FILE_INVALID_MIME_TYPE',
  INVALID_SCOPE = 'FILE_INVALID_SCOPE',
  INVALID_TARGET = 'FILE_INVALID_TARGET',
  INVALID_STORAGE_OBJECT = 'FILE_INVALID_STORAGE_OBJECT',
  INVALID_CHECKSUM = 'FILE_INVALID_CHECKSUM',
  INVALID_DATE = 'FILE_INVALID_DATE',
  INVALID_STATE = 'FILE_INVALID_STATE',
  SCAN_REQUIRED = 'FILE_SCAN_REQUIRED',
  QUOTA_EXCEEDED = 'FILE_QUOTA_EXCEEDED',
}

/** Framework-independent exception raised when a file invariant is violated. */
export class FileDomainException extends Error {
  constructor(
    public readonly code: FileDomainErrorCode,
    message: string
  ) {
    super(message)
    this.name = FileDomainException.name
  }
}
