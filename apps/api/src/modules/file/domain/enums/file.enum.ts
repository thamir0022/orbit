/** File lifecycle state. */
export enum FileStatus {
  PENDING_UPLOAD = 'pending_upload',
  UPLOADED = 'uploaded',
  PROCESSING = 'processing',
  READY = 'ready',
  REJECTED = 'rejected',
  FAILED = 'failed',
  DELETED = 'deleted',
}

/** Independent antivirus or security-scan result. */
export enum FileScanStatus {
  PENDING = 'pending',
  CLEAN = 'clean',
  INFECTED = 'infected',
  FAILED = 'failed',
}

/** Verified broad media classification. */
export enum FileMediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  OTHER = 'other',
}

/** Scope which owns a file and its storage quota. */
export enum FileScopeType {
  WORKSPACE = 'workspace',
  USER = 'user',
}
