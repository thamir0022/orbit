import { Inject, Injectable, type OnModuleDestroy } from '@nestjs/common'
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { StorageObjectRef } from '@/modules/file/domain'
import {
  FILE_CONFIG,
  type IFileConfig,
} from '@/modules/file/application/ports/file-config.port'
import type {
  BrowserUploadGrant,
  ObjectStoragePort,
  ReadObjectGrant,
  StoredObjectInfo,
} from '@/modules/file/application/ports/object-storage.port'

const INLINE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
])

/** S3-compatible private object storage using AWS SDK v3. */
@Injectable()
export class S3ObjectStorageAdapter
  implements ObjectStoragePort, OnModuleDestroy
{
  private readonly client: S3Client

  constructor(
    @Inject(FILE_CONFIG)
    private readonly config: IFileConfig
  ) {
    this.client = new S3Client({
      region: config.s3Region,
      endpoint: config.s3Endpoint,
      forcePathStyle: config.s3ForcePathStyle,
    })
  }

  onModuleDestroy(): void {
    this.client.destroy()
  }

  private check(object: StorageObjectRef): void {
    if (object.locationId !== this.config.storageLocationId) {
      throw new Error('This file is stored in an unconfigured location')
    }
  }

  /** Generates a size-restricted presigned POST for staging uploads. */
  async createSingleUpload(input: {
    object: StorageObjectRef
    contentType: string
    sizeBytes: number
    expiresInSeconds: number
  }): Promise<BrowserUploadGrant> {
    this.check(input.object)

    if (
      !input.object.key.startsWith('staging/') ||
      input.object.versionId ||
      !Number.isSafeInteger(input.sizeBytes) ||
      input.sizeBytes < 1
    ) {
      throw new Error('Invalid staging upload')
    }

    const signed = await createPresignedPost(this.client, {
      Bucket: this.config.s3Bucket,
      Key: input.object.key,
      Expires: input.expiresInSeconds,
      Fields: {
        'Content-Type': input.contentType,
      },
      Conditions: [
        ['content-length-range', input.sizeBytes, input.sizeBytes],
        ['eq', '$Content-Type', input.contentType],
      ],
    })

    return {
      method: 'POST',
      url: signed.url,
      fields: signed.fields,
      expiresAt: new Date(Date.now() + input.expiresInSeconds * 1000),
    }
  }

  /** Retrieves metadata without downloading object content. */
  async inspect(object: StorageObjectRef): Promise<StoredObjectInfo | null> {
    this.check(object)

    try {
      const info = await this.client.send(
        new HeadObjectCommand({
          Bucket: this.config.s3Bucket,
          Key: object.key,
          VersionId: object.versionId ?? undefined,
        })
      )

      if (
        !Number.isSafeInteger(info.ContentLength) ||
        (info.ContentLength ?? -1) < 0
      ) {
        throw new Error('S3 returned an invalid object length')
      }

      return {
        sizeBytes: info.ContentLength!,
        contentType: info.ContentType ?? null,
        etag: info.ETag ?? null,
        versionId: info.VersionId ?? null,
        sha256: info.Metadata?.sha256 ?? null,
      }
    } catch (error: unknown) {
      if (this.isNotFound(error)) {
        return null
      }

      throw error
    }
  }

  /** Streams the requested object with conditional ETag validation. */
  async read(
    object: StorageObjectRef,
    expectedEtag: string
  ): Promise<AsyncIterable<Uint8Array>> {
    this.check(object)

    const result = await this.client.send(
      new GetObjectCommand({
        Bucket: this.config.s3Bucket,
        Key: object.key,
        VersionId: object.versionId ?? undefined,
        IfMatch: expectedEtag,
      })
    )

    if (!result.Body || !(Symbol.asyncIterator in result.Body)) {
      throw new Error('S3 did not return a readable object stream')
    }

    return result.Body as AsyncIterable<Uint8Array>
  }

  /** Copies a verified staging object to immutable storage. */
  async promote(input: {
    source: StorageObjectRef
    destination: StorageObjectRef
    sourceEtag: string
    contentType: string
    sha256: string
    sizeBytes: number
  }): Promise<StorageObjectRef> {
    this.check(input.source)
    this.check(input.destination)

    if (
      !input.source.key.startsWith('staging/') ||
      !input.destination.key.startsWith('objects/') ||
      input.destination.versionId ||
      !input.sourceEtag
    ) {
      throw new Error('Invalid file promotion')
    }

    const source =
      `${this.config.s3Bucket}/` +
      input.source.key.split('/').map(encodeURIComponent).join('/') +
      (input.source.versionId
        ? `?versionId=${encodeURIComponent(input.source.versionId)}`
        : '')

    try {
      const result = await this.client.send(
        new CopyObjectCommand({
          Bucket: this.config.s3Bucket,
          Key: input.destination.key,
          CopySource: source,
          CopySourceIfMatch: input.sourceEtag,
          IfNoneMatch: '*',
          MetadataDirective: 'REPLACE',
          ContentType: input.contentType,
          Metadata: {
            sha256: input.sha256,
          },
        })
      )

      if (!result.CopyObjectResult?.ETag) {
        throw new Error('S3 did not confirm object copy')
      }

      return StorageObjectRef.create({
        locationId: input.destination.locationId,
        key: input.destination.key,
        versionId: result.VersionId ?? null,
      })
    } catch (error: unknown) {
      if (!this.isAlreadyCopied(error)) {
        throw error
      }

      // Retries must never overwrite a permanent object.
      const previous = await this.inspect(input.destination)

      if (
        !previous ||
        previous.sizeBytes !== input.sizeBytes ||
        previous.sha256 !== input.sha256
      ) {
        throw new Error(
          'Existing permanent object does not match verified upload',
          { cause: error }
        )
      }

      return StorageObjectRef.create({
        locationId: input.destination.locationId,
        key: input.destination.key,
        versionId: previous.versionId,
      })
    }
  }

  /** Creates temporary access to an authorized private object. */
  async signRead(input: {
    object: StorageObjectRef
    expiresInSeconds: number
    downloadName: string
    disposition: 'attachment' | 'inline'
    mimeType: string
  }): Promise<ReadObjectGrant> {
    this.check(input.object)

    if (!input.object.key.startsWith('objects/')) {
      throw new Error('Cannot read a staging file')
    }

    const safeName = input.downloadName
      .replace(/["\\\p{Cc}]/gu, '_')
      .slice(0, 150)

    const inline =
      input.disposition === 'inline' && INLINE_MIME_TYPES.has(input.mimeType)

    const command = new GetObjectCommand({
      Bucket: this.config.s3Bucket,
      Key: input.object.key,
      VersionId: input.object.versionId ?? undefined,
      ResponseContentDisposition: inline
        ? 'inline'
        : `attachment; filename="${safeName}"`,
      ResponseContentType: input.mimeType,
    })

    const url = await getSignedUrl(this.client, command, {
      expiresIn: input.expiresInSeconds,
    })

    return {
      url,
      expiresAt: new Date(Date.now() + input.expiresInSeconds * 1000),
    }
  }

  /** Deletes an object or a specific object version. */
  async delete(
    object: StorageObjectRef,
    options?: { readonly permanent: boolean }
  ): Promise<void> {
    this.check(object)

    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.config.s3Bucket,
        Key: object.key,
        // "null" pins an originally unversioned object even if versioning was enabled later.
        VersionId:
          object.versionId ?? (options?.permanent ? 'null' : undefined),
      })
    )
  }

  private isAlreadyCopied(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false
    }

    const failure = error as {
      $metadata?: {
        httpStatusCode?: number
      }
    }

    return failure.$metadata?.httpStatusCode === 412
  }

  private isNotFound(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false
    }

    const failure = error as {
      name?: string
      $metadata?: {
        httpStatusCode?: number
      }
    }

    return (
      failure.name === 'NoSuchKey' ||
      failure.name === 'NotFound' ||
      failure.$metadata?.httpStatusCode === 404
    )
  }
}
