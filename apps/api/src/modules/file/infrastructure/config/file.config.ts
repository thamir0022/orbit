import { ConfigService } from '@nestjs/config'
import type { IFileConfig } from '@/modules/file/application/ports/file-config.port'

function text(config: ConfigService, key: string, fallback?: string): string {
  const value = config.get<string>(key) ?? fallback
  if (!value?.trim()) throw new Error(`${key} must be configured`)
  return value.trim()
}

function positive(
  config: ConfigService,
  key: string,
  fallback: number
): number {
  const raw = config.get<string | number>(key)
  const value = raw === undefined ? fallback : Number(raw)
  if (!Number.isSafeInteger(value) || value < 1)
    throw new Error(`${key} must be a positive integer`)
  return value
}

/** Reads and validates environment settings at module startup. */
export function createFileConfig(config: ConfigService): IFileConfig {
  const endpoint = config.get<string>('FILE_S3_ENDPOINT') || undefined
  if (endpoint) {
    const url = new URL(endpoint)
    if (
      (url.protocol !== 'https:' &&
        !(
          url.protocol === 'http:' &&
          ['127.0.0.1', 'localhost'].includes(url.hostname)
        )) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      throw new Error('FILE_S3_ENDPOINT must be HTTPS, or HTTP on localhost')
    }
  }
  const settings: IFileConfig = {
    s3Bucket: text(config, 'FILE_S3_BUCKET'),
    s3Region: text(config, 'FILE_S3_REGION'),
    storageLocationId: text(config, 'FILE_STORAGE_LOCATION_ID', 'primary'),
    s3Endpoint: endpoint,
    s3ForcePathStyle: config.get<string>('FILE_S3_FORCE_PATH_STYLE') === 'true',
    workspaceQuotaBytes: positive(
      config,
      'FILE_WORKSPACE_QUOTA_BYTES',
      10 * 1024 ** 3
    ),
    userQuotaBytes: positive(config, 'FILE_USER_QUOTA_BYTES', 200 * 1024 ** 2),
    uploadExpiresInSeconds: positive(config, 'FILE_UPLOAD_TTL_SECONDS', 300),
    accessExpiresInSeconds: positive(config, 'FILE_ACCESS_TTL_SECONDS', 60),
    clamAvHost: text(config, 'FILE_CLAMAV_HOST'),
    clamAvPort: positive(config, 'FILE_CLAMAV_PORT', 3310),
    clamAvTimeoutMs: positive(config, 'FILE_CLAMAV_TIMEOUT_MS', 120000),
  }
  if (
    !/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(settings.storageLocationId) ||
    settings.uploadExpiresInSeconds > 900 ||
    settings.accessExpiresInSeconds > 300 ||
    settings.clamAvPort > 65535 ||
    settings.clamAvTimeoutMs < 1000
  )
    throw new Error('Invalid file storage configuration')
  return settings
}
