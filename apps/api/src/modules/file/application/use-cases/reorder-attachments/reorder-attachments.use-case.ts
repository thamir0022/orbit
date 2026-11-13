import { Inject, Injectable } from '@nestjs/common'
import { AttachmentTarget } from '@/modules/file/domain'
import { WorkspaceId } from '@/modules/workspace/domain'
import {
  FILE_UNIT_OF_WORK,
  type FileUnitOfWork,
} from '../../ports/repositories/file-unit-of-work.port'
import {
  FILE_AUTHORIZATION,
  type FileActor,
  type FileAuthorizationPort,
} from '../../ports/file-authorization.port'
import {
  FileApplicationError,
  FileApplicationErrorCode,
} from '../../errors/file-application.error'
import { RepositoryConflictError } from '../../ports/repositories/repository-snapshot'

/** Applies an entire target's order atomically; stale lists cannot overwrite newer edits. */
@Injectable()
export class ReorderAttachments {
  constructor(
    @Inject(FILE_UNIT_OF_WORK) private readonly work: FileUnitOfWork,
    @Inject(FILE_AUTHORIZATION)
    private readonly authorization: FileAuthorizationPort
  ) {}

  async execute(input: {
    actor: FileActor
    target: AttachmentTarget
    items: readonly { id: string; revision: number }[]
  }): Promise<void> {
    if (!input.actor.workspaceId)
      throw new FileApplicationError(
        FileApplicationErrorCode.FORBIDDEN,
        'Select a workspace'
      )
    if (
      !input.items.length ||
      input.items.length > 100 ||
      new Set(input.items.map((item) => item.id)).size !== input.items.length
    ) {
      throw new FileApplicationError(
        FileApplicationErrorCode.INVALID_REQUEST,
        'Supply a unique attachment order with at most 100 items'
      )
    }
    await this.authorization.assertCanManageAttachments({
      actor: input.actor,
      target: input.target,
    })
    const workspaceId = WorkspaceId.create(input.actor.workspaceId)
    await this.work.execute(async (repos) => {
      const records = await repos.attachments.findActiveByTarget({
        workspaceId,
        target: input.target,
        limit: 101,
      })
      const byId = new Map(
        records.map((record) => [record.entity.id.value, record])
      )
      if (
        records.length !== input.items.length ||
        input.items.some(
          (item) => byId.get(item.id)?.revision !== item.revision
        )
      ) {
        throw new RepositoryConflictError(
          'Attachments changed. Refresh before reordering.'
        )
      }
      for (const [position, item] of input.items.entries()) {
        const record = byId.get(item.id)!
        record.entity.setPosition(position)
        await repos.attachments.update(record.entity, record.revision)
      }
    })
  }
}
