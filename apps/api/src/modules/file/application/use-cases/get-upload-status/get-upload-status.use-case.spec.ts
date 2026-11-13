import { UserId } from '@/modules/user/domain'
import {
  File,
  FileMimeType,
  FileScope,
  FileSize,
  StorageObjectRef,
  UploadSession,
} from '@/modules/file/domain'
import type { FileAuthorizationPort } from '../../ports/file-authorization.port'
import type { FileRepository } from '../../ports/repositories/file-repository.port'
import type { UploadSessionRepository } from '../../ports/repositories/upload-session-repository.port'
import { GetUploadStatus } from './get-upload-status.use-case'

describe('Upload processing status', () => {
  function setup() {
    const actor = {
      userId: '01a135b2-ae9e-7671-a9a1-78f4deab4ee8',
      workspaceId: '01a135b2-ae9f-7302-a34f-a24f9d900871',
    }
    const file = File.create({
      scope: FileScope.workspace(actor.workspaceId),
      createdBy: UserId.create(actor.userId),
      originalName: 'example.txt',
      declaredMimeType: FileMimeType.create('text/plain'),
      expectedSize: FileSize.create(5),
    })
    const session = UploadSession.create({
      fileId: file.id,
      initiatedBy: file.createdBy,
      expectedSize: file.expectedSize,
      stagingObject: StorageObjectRef.create({
        locationId: 'primary',
        key: 'staging/test',
      }),
      expiresAt: new Date(Date.now() + 60_000),
    })
    session.complete()
    const files = {
      findById: jest.fn().mockResolvedValue({ entity: file, revision: 0 }),
    }
    const uploads = {
      findById: jest.fn().mockResolvedValue({ entity: session, revision: 0 }),
    }
    const authorization = {
      assertCanCompleteUpload: jest.fn().mockResolvedValue(undefined),
    }
    const processing = { getStatus: jest.fn().mockResolvedValue('retrying') }
    const status = new GetUploadStatus(
      files as unknown as FileRepository,
      uploads as unknown as UploadSessionRepository,
      authorization as unknown as FileAuthorizationPort,
      processing
    )
    return { status, actor, file, session, processing, authorization }
  }

  it('distinguishes retrying verification from successful upload completion', async () => {
    const { status, actor, session, processing } = setup()
    await expect(
      status.execute({ actor, sessionId: session.id.value })
    ).resolves.toMatchObject({
      uploadStatus: 'completed',
      fileStatus: 'pending_upload',
      sizeBytes: null,
      processingStatus: 'retrying',
    })
    expect(processing.getStatus).toHaveBeenCalledTimes(1)
  })

  it('does not query processing state for another workspace', async () => {
    const { status, actor, session, processing } = setup()
    await expect(
      status.execute({
        actor: {
          ...actor,
          workspaceId: '01a135b2-ae9f-7302-a34f-a24f9d900899',
        },
        sessionId: session.id.value,
      })
    ).rejects.toThrow('Upload not found')
    expect(processing.getStatus).not.toHaveBeenCalled()
  })

  it('checks current authorization before exposing queue progress', async () => {
    const { status, actor, session, processing, authorization } = setup()
    authorization.assertCanCompleteUpload.mockRejectedValue(
      new Error('Access revoked')
    )
    await expect(
      status.execute({ actor, sessionId: session.id.value })
    ).rejects.toThrow('Access revoked')
    expect(processing.getStatus).not.toHaveBeenCalled()
  })

  it('uses the terminal file state instead of stale queue failures', async () => {
    const { status, actor, session, processing, file } = setup()
    file.reject('File content failed validation')
    await expect(
      status.execute({ actor, sessionId: session.id.value })
    ).resolves.toMatchObject({ fileStatus: 'rejected', processingStatus: null })
    expect(processing.getStatus).not.toHaveBeenCalled()
  })
})
