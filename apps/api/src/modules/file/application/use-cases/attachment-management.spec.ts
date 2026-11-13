import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '@/modules/workspace/domain'
import {
  Attachment,
  AttachmentTarget,
  AttachmentTargetType,
  File,
  FileChecksum,
  FileMediaType,
  FileMimeType,
  FileScope,
  FileSize,
  FileStatus,
  StorageObjectRef,
} from '@/modules/file/domain'
import type { FileAuthorizationPort } from '../ports/file-authorization.port'
import type {
  FileRepositorySet,
  FileUnitOfWork,
} from '../ports/repositories/file-unit-of-work.port'
import { RepositoryConflictError } from '../ports/repositories/repository-snapshot'
import { AttachFile } from './attach-file/attach-file.use-case'
import { RemoveAttachment } from './remove-attachment/remove-attachment.use-case'
import { ReorderAttachments } from './reorder-attachments/reorder-attachments.use-case'
import { UpdateAttachment } from './update-attachment/update-attachment.use-case'

const actor = {
  userId: '01a135b2-ae9e-7671-a9a1-78f4deab4ee8',
  workspaceId: '01a135b2-ae9f-7302-a34f-a24f9d900871',
}
const target = AttachmentTarget.create(
  AttachmentTargetType.PROJECT,
  '01a135b2-ae9f-7302-a34f-a24f9d900872'
)

describe('Attachment management', () => {
  function setup() {
    const file = File.create({
      scope: FileScope.workspace(actor.workspaceId),
      createdBy: UserId.create(actor.userId),
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
    const links = [0, 1].map((position) =>
      Attachment.create({
        fileId: file.id,
        workspaceId: WorkspaceId.create(actor.workspaceId),
        target,
        createdBy: file.createdBy,
        position,
      })
    )
    const attachments = {
      findById: jest.fn().mockResolvedValue({ entity: links[0], revision: 2 }),
      findActiveByTarget: jest
        .fn()
        .mockResolvedValue(links.map((entity) => ({ entity, revision: 2 }))),
      hasActiveReferences: jest.fn().mockResolvedValue(false),
      findActiveLink: jest.fn().mockResolvedValue(null),
      nextPosition: jest.fn().mockResolvedValue(2),
      insert: jest.fn(),
      update: jest.fn(),
    }
    const files = {
      findById: jest.fn().mockResolvedValue({ entity: file, revision: 3 }),
      update: jest.fn(),
    }
    const work: FileUnitOfWork = {
      execute: (callback) =>
        callback({ attachments, files } as unknown as FileRepositorySet),
    }
    const auth = {
      assertCanManageAttachments: jest.fn().mockResolvedValue(undefined),
      assertCanAttach: jest.fn().mockResolvedValue(undefined),
    }
    const authorization = auth as unknown as FileAuthorizationPort
    return {
      file,
      links,
      attachments,
      files,
      auth,
      attach: new AttachFile(work, authorization),
      remove: new RemoveAttachment(work, authorization),
      rename: new UpdateAttachment(work, authorization),
      reorder: new ReorderAttachments(work, authorization),
    }
  }

  it('uses the original filename by default and appends a new link', async () => {
    const { file, attach, attachments, files } = setup()
    await attach.execute({ actor, fileId: file.id.value, target })
    expect(attachments.insert).toHaveBeenCalledWith(
      expect.objectContaining({ displayName: 'plan.txt', position: 2 })
    )
    expect(files.update).toHaveBeenCalledWith(file, 3)
  })

  it('returns an existing link when attachment creation is retried', async () => {
    const { file, links, attach, attachments } = setup()
    attachments.findActiveLink.mockResolvedValue({
      entity: links[0],
      revision: 2,
    })
    await expect(
      attach.execute({ actor, fileId: file.id.value, target })
    ).resolves.toEqual({
      attachmentId: links[0].id.value,
      fileId: file.id.value,
    })
    expect(attachments.insert).not.toHaveBeenCalled()
  })

  it('renames the link without changing the stored filename or object', async () => {
    const { rename, file, links, files } = setup()
    await rename.execute({
      actor,
      attachmentId: links[0].id.value,
      displayName: '  Roadmap  ',
      revision: 2,
    })
    expect(links[0].displayName).toBe('Roadmap')
    expect(file.originalName).toBe('plan.txt')
    expect(files.update).not.toHaveBeenCalled()
  })

  it('rejects a stale title edit before writing', async () => {
    const { rename, links, attachments } = setup()
    await expect(
      rename.execute({
        actor,
        attachmentId: links[0].id.value,
        displayName: 'Roadmap',
        revision: 1,
      })
    ).rejects.toBeInstanceOf(RepositoryConflictError)
    expect(attachments.update).not.toHaveBeenCalled()
  })

  it.each(['', 'bad\nname'])(
    'rejects an invalid title %j',
    async (displayName) => {
      const { rename, links, attachments } = setup()
      await expect(
        rename.execute({
          actor,
          attachmentId: links[0].id.value,
          displayName,
          revision: 2,
        })
      ).rejects.toThrow()
      expect(attachments.update).not.toHaveBeenCalled()
    }
  )

  it('persists an entire reordered list', async () => {
    const { reorder, links, attachments } = setup()
    await reorder.execute({
      actor,
      target,
      items: [...links]
        .reverse()
        .map((link) => ({ id: link.id.value, revision: 2 })),
    })
    expect(links.map((link) => link.position)).toEqual([1, 0])
    expect(attachments.update).toHaveBeenCalledTimes(2)
  })

  it.each(['stale', 'missing', 'foreign', 'duplicate'])(
    'rejects a %s order without partial writes',
    async (kind) => {
      const { reorder, links, attachments } = setup()
      const items = links.map((link) => ({ id: link.id.value, revision: 2 }))
      if (kind === 'stale') items[1].revision = 1
      if (kind === 'missing') items.pop()
      if (kind === 'foreign')
        items[1].id = '01a135b2-ae9f-7302-a34f-a24f9d900899'
      if (kind === 'duplicate') items[1].id = items[0].id
      await expect(reorder.execute({ actor, target, items })).rejects.toThrow()
      expect(attachments.update).not.toHaveBeenCalled()
    }
  )

  it('preserves a shared file while detaching one link', async () => {
    const { file, links, remove, attachments, files } = setup()
    attachments.hasActiveReferences.mockResolvedValue(true)
    await remove.execute({ actor, attachmentId: links[0].id.value })
    expect(links[0].deletedAt).not.toBeNull()
    expect(file.status).toBe(FileStatus.READY)
    expect(files.update).toHaveBeenCalledWith(file, 3)
  })

  it('tombstones the file on last detach and treats retries idempotently', async () => {
    const { file, links, remove, files } = setup()
    await remove.execute({ actor, attachmentId: links[0].id.value })
    await remove.execute({ actor, attachmentId: links[0].id.value })
    expect(file.status).toBe(FileStatus.DELETED)
    expect(file.purgedAt).toBeNull()
    expect(files.update).toHaveBeenCalledTimes(1)
  })

  it('rejects deletion across workspaces before authorization or writes', async () => {
    const { links, remove, attachments, auth } = setup()
    await expect(
      remove.execute({
        actor: {
          ...actor,
          workspaceId: '01a135b2-ae9f-7302-a34f-a24f9d900899',
        },
        attachmentId: links[0].id.value,
      })
    ).rejects.toThrow('Attachment not found')
    expect(auth.assertCanManageAttachments).not.toHaveBeenCalled()
    expect(attachments.update).not.toHaveBeenCalled()
  })
})
