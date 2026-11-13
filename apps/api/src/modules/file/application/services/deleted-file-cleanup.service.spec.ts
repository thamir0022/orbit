import { Logger } from '@nestjs/common'
import { UserId } from '@/modules/user/domain'
import {
  File,
  FileChecksum,
  FileMediaType,
  FileMimeType,
  FileScope,
  FileSize,
  StorageObjectRef,
  StorageUsage,
} from '@/modules/file/domain'
import type { ObjectStoragePort } from '../ports/object-storage.port'
import type { AttachmentRepository } from '../ports/repositories/attachment-repository.port'
import type { FileRepository } from '../ports/repositories/file-repository.port'
import type {
  FileRepositorySet,
  FileUnitOfWork,
} from '../ports/repositories/file-unit-of-work.port'
import {
  DeletedFileCleanup,
  DELETED_FILE_RETENTION_MS,
} from './deleted-file-cleanup.service'

describe('Deleted file cleanup', () => {
  function setup(age = DELETED_FILE_RETENTION_MS + 1000) {
    const file = File.create({
      scope: FileScope.workspace('01a135b2-ae9f-7302-a34f-a24f9d900871'),
      createdBy: UserId.create('01a135b2-ae9e-7671-a9a1-78f4deab4ee8'),
      originalName: 'plan.txt',
      declaredMimeType: FileMimeType.create('text/plain'),
      expectedSize: FileSize.create(5),
    })
    file.confirmUpload({
      size: file.expectedSize,
      mimeType: file.declaredMimeType,
      mediaType: FileMediaType.DOCUMENT,
      checksum: FileChecksum.create('a'.repeat(64)),
    })
    file.beginProcessing()
    file.markScanClean()
    file.markReady(
      StorageObjectRef.create({
        locationId: 'primary',
        key: 'files/plan',
        versionId: 'v1',
      })
    )
    file.delete(new Date(Date.now() - age))
    const usage = StorageUsage.create(file.scope)
    usage.reserve(file.expectedSize, FileSize.create(100))
    usage.commitReservation(file.expectedSize, file.expectedSize)
    const files = {
      findDeletedBefore: jest
        .fn()
        .mockResolvedValue([{ entity: file, revision: 2 }]),
      findById: jest.fn().mockResolvedValue({ entity: file, revision: 2 }),
      update: jest.fn(),
    }
    const attachments = {
      hasActiveReferences: jest.fn().mockResolvedValue(false),
    }
    const usageRepo = {
      findByScope: jest.fn().mockResolvedValue({ entity: usage, revision: 2 }),
      update: jest.fn(),
    }
    const work: FileUnitOfWork = {
      execute: (callback) =>
        callback({
          files,
          attachments,
          usage: usageRepo,
        } as unknown as FileRepositorySet),
    }
    const storage = { delete: jest.fn().mockResolvedValue(undefined) }
    const cleanup = new DeletedFileCleanup(
      files as unknown as FileRepository,
      attachments as unknown as AttachmentRepository,
      work,
      storage as unknown as ObjectStoragePort
    )
    return { file, usage, files, attachments, usageRepo, storage, cleanup }
  }

  it('waits for the retention period', async () => {
    const { cleanup, storage, usage } = setup(1000)
    await expect(cleanup.execute()).resolves.toBe(0)
    expect(storage.delete).not.toHaveBeenCalled()
    expect(usage.usedBytes).toBe(5)
  })

  it('does not purge any file with active references', async () => {
    const { cleanup, storage, attachments } = setup()
    attachments.hasActiveReferences.mockResolvedValue(true)
    await expect(cleanup.execute()).resolves.toBe(0)
    expect(storage.delete).not.toHaveBeenCalled()
  })

  it('deletes the exact stored version and releases quota only once', async () => {
    const { cleanup, storage, file, usage, usageRepo } = setup()
    await expect(cleanup.execute()).resolves.toBe(1)
    expect(storage.delete).toHaveBeenCalledWith(file.storageObject, {
      permanent: true,
    })
    expect(file.purgedAt).not.toBeNull()
    expect(usage.usedBytes).toBe(0)
    await expect(cleanup.execute()).resolves.toBe(0)
    expect(storage.delete).toHaveBeenCalledTimes(1)
    expect(usageRepo.update).toHaveBeenCalledTimes(1)
  })

  it('keeps quota and the tombstone retryable after a provider failure', async () => {
    const { cleanup, storage, file, usage, usageRepo } = setup()
    const log = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined)
    try {
      storage.delete.mockRejectedValueOnce(new Error('Provider unavailable'))
      await expect(cleanup.execute()).resolves.toBe(0)
      expect(usage.usedBytes).toBe(5)
      expect(file.purgedAt).toBeNull()
      expect(usageRepo.update).not.toHaveBeenCalled()
      expect(file.purgeAttemptedAt).not.toBeNull()
      await expect(cleanup.execute()).resolves.toBe(1)
    } finally {
      log.mockRestore()
    }
  })
})
