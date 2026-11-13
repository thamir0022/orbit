import { UserId } from '@/modules/user/domain'
import {
  File,
  FileMimeType,
  FileScope,
  FileSize,
  FileStatus,
  StorageObjectRef,
  StorageUsage,
  UploadSession,
  UploadSessionStatus,
} from '@/modules/file/domain'
import type { ObjectStoragePort } from '../ports/object-storage.port'
import type {
  FileRepositorySet,
  FileUnitOfWork,
} from '../ports/repositories/file-unit-of-work.port'
import type { UploadSessionRepository } from '../ports/repositories/upload-session-repository.port'
import { ExpiredUploadCleanup } from './expired-upload-cleanup.service'

describe('Expired upload cleanup', () => {
  function setup(completed: boolean) {
    const now = new Date(Date.now() - 120_000)
    const file = File.create({
      scope: FileScope.workspace('01a135b2-ae9f-7302-a34f-a24f9d900871'),
      createdBy: UserId.create('01a135b2-ae9e-7671-a9a1-78f4deab4ee8'),
      originalName: 'example.txt',
      declaredMimeType: FileMimeType.create('text/plain'),
      expectedSize: FileSize.create(5),
      now,
    })
    const session = UploadSession.create({
      fileId: file.id,
      initiatedBy: file.createdBy,
      stagingObject: StorageObjectRef.create({
        locationId: 'primary',
        key: 'staging/test',
      }),
      expectedSize: file.expectedSize,
      now,
      expiresAt: new Date(now.getTime() + 60_000),
    })
    // Simulates completion winning after the scheduler's stale expiry query.
    if (completed) session.complete(new Date(now.getTime() + 30_000))
    const usage = StorageUsage.create(file.scope)
    usage.reserve(file.expectedSize, FileSize.create(100))
    const uploads = {
      findExpired: jest
        .fn()
        .mockResolvedValue([{ entity: session, revision: 0 }]),
      findById: jest.fn().mockResolvedValue({ entity: session, revision: 0 }),
      update: jest.fn(),
    }
    const repos = {
      uploads,
      files: {
        findById: jest.fn().mockResolvedValue({ entity: file, revision: 0 }),
        update: jest.fn(),
      },
      usage: {
        findByScope: jest
          .fn()
          .mockResolvedValue({ entity: usage, revision: 0 }),
        update: jest.fn(),
      },
    }
    const unitOfWork: FileUnitOfWork = {
      execute: (work) => work(repos as unknown as FileRepositorySet),
    }
    const storage = { delete: jest.fn().mockResolvedValue(undefined) }
    const cleanup = new ExpiredUploadCleanup(
      uploads as unknown as UploadSessionRepository,
      unitOfWork,
      storage as unknown as ObjectStoragePort
    )
    return { cleanup, storage, file, session, usage, uploads }
  }

  it('keeps staging bytes and quota when completion won the race', async () => {
    const { cleanup, storage, file, session, usage, uploads } = setup(true)
    await expect(cleanup.execute()).resolves.toBe(0)
    expect(storage.delete).not.toHaveBeenCalled()
    expect(uploads.update).not.toHaveBeenCalled()
    expect(session.status).toBe(UploadSessionStatus.COMPLETED)
    expect(file.status).toBe(FileStatus.PENDING_UPLOAD)
    expect(usage.reservedBytes).toBe(5)
  })

  it('expires abandoned sessions and releases their reservation', async () => {
    const { cleanup, storage, file, session, usage } = setup(false)
    await expect(cleanup.execute()).resolves.toBe(1)
    expect(storage.delete).toHaveBeenCalledWith(session.stagingObject)
    expect(session.status).toBe(UploadSessionStatus.EXPIRED)
    expect(file.status).toBe(FileStatus.REJECTED)
    expect(usage.reservedBytes).toBe(0)
  })
})
