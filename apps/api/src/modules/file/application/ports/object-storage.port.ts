import type { StorageObjectRef } from '@/modules/file/domain'

interface UploadGrantBase {
  readonly url: string
  readonly expiresAt: Date
}

/** Provider instructions: multipart POST or a signed raw-body PUT. */
export type BrowserUploadGrant = UploadGrantBase &
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

export interface StoredObjectInfo {
  readonly sizeBytes: number
  readonly contentType: string | null
  readonly etag: string | null
  readonly versionId: string | null
  readonly sha256: string | null
}

export interface ReadObjectGrant {
  readonly url: string
  readonly expiresAt: Date
}

/** Cloud-agnostic private binary storage gateway. */
export interface ObjectStoragePort {
  createSingleUpload(input: {
    object: StorageObjectRef
    contentType: string
    sizeBytes: number
    expiresInSeconds: number
  }): Promise<BrowserUploadGrant>

  inspect(object: StorageObjectRef): Promise<StoredObjectInfo | null>
  read(
    object: StorageObjectRef,
    expectedEtag: string
  ): Promise<AsyncIterable<Uint8Array>>
  promote(input: {
    source: StorageObjectRef
    destination: StorageObjectRef
    sourceEtag: string
    contentType: string
    sha256: string
    sizeBytes: number
  }): Promise<StorageObjectRef>
  signRead(input: {
    object: StorageObjectRef
    expiresInSeconds: number
    downloadName: string
    disposition: 'attachment' | 'inline'
    mimeType: string
  }): Promise<ReadObjectGrant>
  /** Permanent deletion removes the exact immutable revision, including a provider's unversioned revision. */
  delete(
    object: StorageObjectRef,
    options?: { readonly permanent: boolean }
  ): Promise<void>
}

export const OBJECT_STORAGE = Symbol('IObjectStoragePort')
