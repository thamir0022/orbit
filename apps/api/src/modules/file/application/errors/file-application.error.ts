/** Stable, transport-neutral failure reasons for file workflows. */
export enum FileApplicationErrorCode {
  INVALID_REQUEST = 'FILE_INVALID_REQUEST',
  NOT_FOUND = 'FILE_NOT_FOUND',
  FORBIDDEN = 'FILE_FORBIDDEN',
  CONFLICT = 'FILE_CONFLICT',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  UNSUPPORTED_MEDIA = 'FILE_UNSUPPORTED_MEDIA',
  FILE_UNAVAILABLE = 'FILE_UNAVAILABLE',
  EXPIRED_UPLOAD = 'FILE_EXPIRED_UPLOAD',
}

/** Application failure, mapped to HTTP only by the presentation layer. */
export class FileApplicationError extends Error {
  constructor(
    readonly code: FileApplicationErrorCode,
    message: string
  ) {
    super(message)
    this.name = FileApplicationError.name
  }
}
