import { UserId } from '@/modules/user/domain'
import {
  File,
  FileMimeType,
  FileScope,
  FileSize,
  FileStatus,
  FileMediaType,
  StorageObjectRef,
  UploadSession,
} from '@/modules/file/domain'
import type { FileRepository } from '../../ports/repositories/file-repository.port'
import type { UploadSessionRepository } from '../../ports/repositories/upload-session-repository.port'
import type {
  FileRepositorySet,
  FileUnitOfWork,
} from '../../ports/repositories/file-unit-of-work.port'
import type { ObjectStoragePort } from '../../ports/object-storage.port'
import type { PromoteFile } from '../promote-file/promote-file.use-case'
import { VerifyAndScanFile } from './verify-and-scan-file.use-case'

describe('File verification', () => {
  function setup() {
    const file = File.create({
      scope: FileScope.workspace('01a135b2-ae9f-7302-a34f-a24f9d900871'),
      createdBy: UserId.create('01a135b2-ae9e-7671-a9a1-78f4deab4ee8'),
      originalName: 'example.txt',
      declaredMimeType: FileMimeType.create('text/plain'),
      expectedSize: FileSize.create(5),
    })
    const staging = StorageObjectRef.create({
      locationId: 'primary',
      key: 'staging/test',
    })
    const session = UploadSession.create({
      fileId: file.id,
      initiatedBy: file.createdBy,
      stagingObject: staging,
      expectedSize: file.expectedSize,
      expiresAt: new Date(Date.now() + 60_000),
    })
    session.complete()
    const files = {
      findById: jest.fn().mockResolvedValue({ entity: file, revision: 0 }),
      update: jest.fn(),
    }
    const uploads = {
      findByFileId: jest
        .fn()
        .mockResolvedValue({ entity: session, revision: 0 }),
    }
    const unitOfWork: FileUnitOfWork = {
      execute: (work) => work({ files } as unknown as FileRepositorySet),
    }
    const storage = {
      inspect: jest
        .fn()
        .mockResolvedValue({ sizeBytes: 5, etag: 'etag', versionId: 'v1' }),
    }
    const inspector = {
      inspect: jest.fn().mockResolvedValue({
        sizeBytes: 5,
        mimeType: 'text/plain',
        mediaType: FileMediaType.DOCUMENT,
        sha256: 'a'.repeat(64),
      }),
    }
    const scanner = {
      scan: jest.fn().mockResolvedValue({ clean: true, reason: null }),
    }
    const promote = { execute: jest.fn() }
    const verify = new VerifyAndScanFile(
      files as unknown as FileRepository,
      uploads as unknown as UploadSessionRepository,
      unitOfWork,
      storage as unknown as ObjectStoragePort,
      inspector,
      scanner,
      promote as unknown as PromoteFile
    )
    return { verify, file, scanner, promote, inspector }
  }

  it('never promotes or marks a file clean during a scanner outage', async () => {
    const { verify, file, scanner, promote } = setup()
    scanner.scan.mockRejectedValue(new Error('Scanner unavailable'))
    await expect(verify.execute(file.id.value)).rejects.toThrow(
      'Scanner unavailable'
    )
    expect(promote.execute).not.toHaveBeenCalled()
    expect(file.status).toBe(FileStatus.PENDING_UPLOAD)
  })

  it('promotes the exact object version that passed inspection and scanning', async () => {
    const { verify, file, scanner, promote, inspector } = setup()
    await verify.execute(file.id.value)
    const pinned = StorageObjectRef.create({
      locationId: 'primary',
      key: 'staging/test',
      versionId: 'v1',
    })
    expect(inspector.inspect).toHaveBeenCalledWith(
      expect.objectContaining({ object: pinned })
    )
    expect(scanner.scan).toHaveBeenCalledWith(pinned, 'etag')
    expect(promote.execute).toHaveBeenCalledWith(
      expect.objectContaining({ stagingObject: pinned })
    )
  })
})
