import {
  FileMediaType,
  FileScopeType,
  type FileScope,
} from '@/modules/file/domain'
import {
  FileApplicationError,
  FileApplicationErrorCode,
} from '../errors/file-application.error'
import {
  FileUploadPurpose,
  type FileUploadPolicyPort,
  type ResolvedUploadPolicy,
} from '../ports/file-upload-policy.port'

const MIB = 1024 * 1024

/** Deliberately conservative allowlist; archives, HTML, SVG and Office containers are excluded until hardened parsers exist. */
const ALLOWED_MIME_TYPES: Readonly<
  Record<
    string,
    { media: FileMediaType; bytes: number; extensions: readonly string[] }
  >
> = {
  'image/jpeg': {
    media: FileMediaType.IMAGE,
    bytes: 10 * MIB,
    extensions: ['.jpg', '.jpeg'],
  },
  'image/png': {
    media: FileMediaType.IMAGE,
    bytes: 10 * MIB,
    extensions: ['.png'],
  },
  'image/webp': {
    media: FileMediaType.IMAGE,
    bytes: 10 * MIB,
    extensions: ['.webp'],
  },
  'image/gif': {
    media: FileMediaType.IMAGE,
    bytes: 10 * MIB,
    extensions: ['.gif'],
  },
  'application/pdf': {
    media: FileMediaType.DOCUMENT,
    bytes: 25 * MIB,
    extensions: ['.pdf'],
  },
  'text/plain': {
    media: FileMediaType.DOCUMENT,
    bytes: 10 * MIB,
    extensions: ['.txt', '.log'],
  },
  'video/mp4': {
    media: FileMediaType.VIDEO,
    bytes: 100 * MIB,
    extensions: ['.mp4'],
  },
  'video/webm': {
    media: FileMediaType.VIDEO,
    bytes: 100 * MIB,
    extensions: ['.webm'],
  },
  'audio/mpeg': {
    media: FileMediaType.AUDIO,
    bytes: 25 * MIB,
    extensions: ['.mp3'],
  },
  'audio/wav': {
    media: FileMediaType.AUDIO,
    bytes: 25 * MIB,
    extensions: ['.wav'],
  },
}

/** Server-controlled upload policy; extend via configuration without trusting user-declared limits. */
export class DefaultFileUploadPolicy implements FileUploadPolicyPort {
  constructor(
    private readonly workspaceQuotaBytes = 10 * 1024 * MIB,
    private readonly userQuotaBytes = 200 * MIB
  ) {
    if (
      ![workspaceQuotaBytes, userQuotaBytes].every(
        (n) => Number.isSafeInteger(n) && n > 0
      )
    ) {
      throw new Error(
        'Storage quota configuration must contain positive safe integers'
      )
    }
  }

  resolve(input: {
    scope: FileScope
    purpose: FileUploadPurpose
    mimeType: string
    originalName: string
    sizeBytes: number
  }): ResolvedUploadPolicy {
    const rule = ALLOWED_MIME_TYPES[input.mimeType]
    const extension = input.originalName
      .slice(input.originalName.lastIndexOf('.'))
      .toLowerCase()
    if (!rule || !rule.extensions.includes(extension)) {
      throw new FileApplicationError(
        FileApplicationErrorCode.UNSUPPORTED_MEDIA,
        'This file type is not supported'
      )
    }
    const isAvatar = [
      FileUploadPurpose.USER_AVATAR,
      FileUploadPurpose.TEAM_AVATAR,
      FileUploadPurpose.WORKSPACE_LOGO,
    ].includes(input.purpose)
    const isImageOnly =
      isAvatar || input.purpose === FileUploadPurpose.PROJECT_COVER
    if (isImageOnly && rule.media !== FileMediaType.IMAGE) {
      throw new FileApplicationError(
        FileApplicationErrorCode.UNSUPPORTED_MEDIA,
        'An image is required for this upload purpose'
      )
    }
    if (
      input.scope.type === FileScopeType.USER &&
      input.purpose !== FileUploadPurpose.USER_AVATAR
    ) {
      throw new FileApplicationError(
        FileApplicationErrorCode.INVALID_REQUEST,
        'Only profile images may use a user scope'
      )
    }
    if (
      input.scope.type === FileScopeType.WORKSPACE &&
      input.purpose === FileUploadPurpose.USER_AVATAR
    ) {
      throw new FileApplicationError(
        FileApplicationErrorCode.INVALID_REQUEST,
        'Profile images must use the user scope'
      )
    }
    const limit = isAvatar ? 5 * MIB : rule.bytes
    if (
      !Number.isSafeInteger(input.sizeBytes) ||
      input.sizeBytes <= 0 ||
      input.sizeBytes > limit
    ) {
      throw new FileApplicationError(
        FileApplicationErrorCode.FILE_TOO_LARGE,
        `File size must be between 1 and ${limit} bytes`
      )
    }
    return {
      mediaType: rule.media,
      maxFileBytes: limit,
      quotaBytes:
        input.scope.type === FileScopeType.USER
          ? this.userQuotaBytes
          : this.workspaceQuotaBytes,
    }
  }
}
