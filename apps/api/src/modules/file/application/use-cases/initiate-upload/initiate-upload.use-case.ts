import { Inject, Injectable } from '@nestjs/common'
import {
  FILE_CONFIG,
  type IFileConfig,
} from '@/modules/file/application/ports/file-config.port'
import {
  AttachmentTarget,
  File,
  FileMimeType,
  FileScope,
  FileSize,
  StorageUsage,
  UploadSession,
} from '@/modules/file/domain'
import { UserId } from '@/modules/user/domain'
import {
  FileApplicationError,
  FileApplicationErrorCode,
} from '../../errors/file-application.error'
import type { FileUnitOfWork } from '../../ports/repositories/file-unit-of-work.port'
import type {
  ObjectStoragePort,
  BrowserUploadGrant,
} from '../../ports/object-storage.port'
import type { StorageObjectKeyFactoryPort } from '../../ports/storage-object-key-factory.port'
import type {
  FileAuthorizationPort,
  FileActor,
} from '../../ports/file-authorization.port'
import type { FileUploadPolicyPort } from '../../ports/file-upload-policy.port'
import { FileUploadPurpose } from '../../ports/file-upload-policy.port'
import { FILE_UNIT_OF_WORK } from '@/modules/file/application/ports/repositories/file-unit-of-work.port'
import { OBJECT_STORAGE } from '@/modules/file/application/ports/object-storage.port'
import { STORAGE_OBJECT_KEY_FACTORY } from '@/modules/file/application/ports/storage-object-key-factory.port'
import { FILE_AUTHORIZATION } from '@/modules/file/application/ports/file-authorization.port'
import { FILE_UPLOAD_POLICY } from '@/modules/file/application/ports/file-upload-policy.port'
import { retryRepositoryConflict } from '../../services/repository-conflict-retry'

/** Request for a single-object direct upload. Workspace identity comes from the authenticated principal. */
export interface InitiateUploadInput {
  readonly actor: FileActor
  readonly scope: 'user' | 'workspace'
  readonly purpose: FileUploadPurpose
  readonly originalName: string
  readonly mimeType: string
  readonly sizeBytes: number
  readonly target: AttachmentTarget | null
}

export interface InitiateUploadOutput {
  readonly fileId: string
  readonly uploadSessionId: string
  readonly expiresAt: Date
  readonly upload: BrowserUploadGrant
}

/** Validates authorization and quota, then persists an upload intent and grants browser-only staging access. */
@Injectable()
export class InitiateUpload {
  constructor(
    @Inject(FILE_UNIT_OF_WORK) private readonly unitOfWork: FileUnitOfWork,
    @Inject(OBJECT_STORAGE) private readonly storage: ObjectStoragePort,
    @Inject(STORAGE_OBJECT_KEY_FACTORY)
    private readonly keys: StorageObjectKeyFactoryPort,
    @Inject(FILE_AUTHORIZATION)
    private readonly authorization: FileAuthorizationPort,
    @Inject(FILE_UPLOAD_POLICY) private readonly policy: FileUploadPolicyPort,
    @Inject(FILE_CONFIG) private readonly config: IFileConfig
  ) {}

  async execute(input: InitiateUploadInput): Promise<InitiateUploadOutput> {
    // Derive ownership from the verified principal; a request body cannot choose another tenant.
    if (input.scope === 'workspace' && !input.actor.workspaceId) {
      throw new FileApplicationError(
        FileApplicationErrorCode.FORBIDDEN,
        'A workspace must be selected'
      )
    }
    const scope =
      input.scope === 'user'
        ? FileScope.user(input.actor.userId)
        : FileScope.workspace(input.actor.workspaceId!)
    const mimeType = FileMimeType.create(input.mimeType)
    const size = FileSize.create(input.sizeBytes)
    const limits = this.policy.resolve({
      scope,
      purpose: input.purpose,
      originalName: input.originalName,
      mimeType: mimeType.value,
      sizeBytes: size.bytes,
    })
    await this.authorization.assertCanUpload({
      actor: input.actor,
      scope,
      purpose: input.purpose,
      target: input.target,
    })

    const file = File.create({
      scope,
      createdBy: UserId.create(input.actor.userId),
      originalName: input.originalName,
      declaredMimeType: mimeType,
      expectedSize: size,
    })
    const staging = this.keys.staging(scope, file.id)
    const session = UploadSession.create({
      fileId: file.id,
      initiatedBy: file.createdBy,
      stagingObject: staging,
      expectedSize: size,
      expiresAt: new Date(
        Date.now() + this.config.uploadExpiresInSeconds * 1000 + 60_000
      ),
    })
    // External signing happens before the transaction. Uncommitted grants can only write to private staging.
    const grant = await this.storage.createSingleUpload({
      object: staging,
      contentType: mimeType.value,
      sizeBytes: size.bytes,
      expiresInSeconds: this.config.uploadExpiresInSeconds,
    })
    await retryRepositoryConflict(() =>
      this.unitOfWork.execute(async (repos) => {
        const usageSnapshot = await repos.usage.findByScope(scope)
        const usage = usageSnapshot?.entity ?? StorageUsage.create(scope)
        usage.reserve(size, FileSize.create(limits.quotaBytes))
        if (usageSnapshot)
          await repos.usage.update(usage, usageSnapshot.revision)
        else await repos.usage.insert(usage)
        await repos.files.insert(file)
        await repos.uploads.insert(session)
      })
    )

    return {
      fileId: file.id.value,
      uploadSessionId: session.id.value,
      expiresAt: grant.expiresAt,
      upload: grant,
    }
  }
}
