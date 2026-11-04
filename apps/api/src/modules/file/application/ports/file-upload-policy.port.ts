import type { FileMediaType, FileScope } from '@/modules/file/domain'

/** Upload intent drives allowed content types, maximum bytes and tenancy restrictions. */
export enum FileUploadPurpose {
  ATTACHMENT = 'attachment',
  INLINE = 'inline',
  USER_AVATAR = 'user_avatar',
  TEAM_AVATAR = 'team_avatar',
  WORKSPACE_LOGO = 'workspace_logo',
  PROJECT_COVER = 'project_cover',
}

/** Limits are byte counts, never MiB-converted values supplied by the browser. */
export interface ResolvedUploadPolicy {
  readonly mediaType: FileMediaType
  readonly maxFileBytes: number
  readonly quotaBytes: number
}

/** Resolve a server-owned policy using validated upload intent. */
export interface FileUploadPolicyPort {
  resolve(input: {
    scope: FileScope
    purpose: FileUploadPurpose
    mimeType: string
    originalName: string
    sizeBytes: number
  }): ResolvedUploadPolicy
}

export const FILE_UPLOAD_POLICY = Symbol('IFileUploadPolicy')
