/** Validated FileModule runtime configuration (never persisted with entities). */
export interface IFileConfig {
  readonly s3Bucket: string
  readonly s3Region: string
  readonly storageLocationId: string
  readonly s3Endpoint?: string
  readonly s3ForcePathStyle: boolean
  readonly workspaceQuotaBytes: number
  readonly userQuotaBytes: number
  readonly uploadExpiresInSeconds: number
  readonly accessExpiresInSeconds: number
  readonly clamAvHost: string
  readonly clamAvPort: number
  readonly clamAvTimeoutMs: number
}

export const FILE_CONFIG = Symbol('IFileConfig')
