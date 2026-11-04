import { Inject, Injectable } from '@nestjs/common'

import {
  PROJECT_REPOSITORY,
  type ProjectRepository,
} from '@/modules/project/application/ports/project-repository.port'
import { ProjectId } from '@/modules/project/domain/value-objects/project-id.vo'

import { UserId } from '@/modules/user/domain'
import {
  WORKSPACE_MEMBER_REPOSITORY,
  type IWorkspaceMemberRepository,
} from '@/modules/workspace/application/repository/workspace-member.repository.interface'
import { WorkspaceId, WorkspaceMemberStatus } from '@/modules/workspace/domain'

import {
  WORK_ITEM_REPOSITORY,
  type WorkItemRepository,
} from '@/modules/workitem/application/ports/work-item-repository.port'
import { WorkItemId } from '@/modules/workitem/domain/value-objects/work-item-id.vo'

import {
  AttachmentTargetType,
  FileScopeType,
  type Attachment,
  type AttachmentTarget,
  type File,
  type FileScope,
} from '../../domain'

import { FileUploadPurpose } from '../../application/ports/file-upload-policy.port'
import {
  type FileActor,
  type FileAuthorizationPort,
} from '../../application/ports/file-authorization.port'
import {
  FileApplicationError,
  FileApplicationErrorCode,
} from '../../application/errors/file-application.error'

/**
 * Enforces tenant isolation and existing resource access rules.
 *
 * Workspace resources currently use workspace-wide visibility.
 * Unsupported targets are denied until their permissions are integrated.
 */
@Injectable()
export class OrbitFileAuthorizationAdapter implements FileAuthorizationPort {
  constructor(
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly members: IWorkspaceMemberRepository,

    @Inject(PROJECT_REPOSITORY)
    private readonly projects: ProjectRepository,

    @Inject(WORK_ITEM_REPOSITORY)
    private readonly workItems: WorkItemRepository
  ) {}

  /** Authorizes a new upload for its intended scope and target. */
  async assertCanUpload(input: {
    actor: FileActor
    scope: FileScope
    purpose: FileUploadPurpose
    target: AttachmentTarget | null
  }): Promise<void> {
    const { actor, scope, purpose, target } = input

    if (scope.type === FileScopeType.USER) {
      this.assertUserOwnership(actor, scope.id)

      if (purpose !== FileUploadPurpose.USER_AVATAR || target !== null) {
        this.forbid()
      }

      return
    }

    await this.assertActiveWorkspaceMember(actor, scope.id)

    if (
      (purpose !== FileUploadPurpose.ATTACHMENT &&
        purpose !== FileUploadPurpose.INLINE) ||
      !target
    ) {
      this.forbid()
    }

    await this.assertTargetAccessible(scope.id, target)
  }

  /** Rechecks uploader ownership and membership after upload. */
  async assertCanCompleteUpload(input: {
    actor: FileActor
    file: File
  }): Promise<void> {
    const { actor, file } = input

    if (file.createdBy.value !== actor.userId) {
      this.forbid()
    }

    if (file.scope.type === FileScopeType.USER) {
      this.assertUserOwnership(actor, file.scope.id)
      return
    }

    await this.assertActiveWorkspaceMember(actor, file.scope.id)
  }

  /** Ensures an uploaded file can be linked to the requested target. */
  async assertCanAttach(input: {
    actor: FileActor
    file: File
    target: AttachmentTarget
  }): Promise<void> {
    const { actor, file, target } = input

    if (
      file.scope.type !== FileScopeType.WORKSPACE ||
      file.createdBy.value !== actor.userId
    ) {
      this.forbid()
    }

    await this.assertActiveWorkspaceMember(actor, file.scope.id)

    await this.assertTargetAccessible(file.scope.id, target)
  }

  /** Authorizes listing attachments on an existing target. */
  async assertCanListAttachments(input: {
    actor: FileActor
    target: AttachmentTarget
  }): Promise<void> {
    const workspaceId = this.requireWorkspaceId(input.actor)

    await this.assertActiveWorkspaceMember(input.actor, workspaceId)

    await this.assertTargetAccessible(workspaceId, input.target)
  }

  /** Authorizes removal of an existing attachment relationship. */
  async assertCanRemoveAttachment(input: {
    actor: FileActor
    attachment: Attachment
  }): Promise<void> {
    const { actor, attachment } = input

    if (attachment.deletedAt !== null) {
      this.notFound()
    }

    const workspaceId = attachment.workspaceId.value

    await this.assertActiveWorkspaceMember(actor, workspaceId)

    await this.assertTargetAccessible(workspaceId, attachment.target)
  }

  /** Authorizes private file access through ownership or a valid link. */
  async assertCanRead(input: {
    actor: FileActor
    file: File
    attachment: Attachment | null
  }): Promise<void> {
    const { actor, file, attachment } = input

    if (file.scope.type === FileScopeType.USER) {
      if (attachment !== null) {
        this.forbid()
      }

      this.assertUserOwnership(actor, file.scope.id)
      return
    }

    if (
      !attachment ||
      attachment.deletedAt !== null ||
      attachment.fileId.value !== file.id.value ||
      attachment.workspaceId.value !== file.scope.id
    ) {
      this.forbid()
    }

    await this.assertActiveWorkspaceMember(actor, file.scope.id)

    await this.assertTargetAccessible(file.scope.id, attachment.target)
  }

  /** Validates that the actor belongs to the requested workspace. */
  private async assertActiveWorkspaceMember(
    actor: FileActor,
    workspaceId: string
  ): Promise<void> {
    if (actor.workspaceId !== workspaceId) {
      this.forbid()
    }

    const member = await this.members.findMember({
      workspaceId: WorkspaceId.create(workspaceId),
      memberId: UserId.create(actor.userId),
    })

    if (member?.status !== WorkspaceMemberStatus.ACTIVE) {
      this.forbid()
    }
  }

  /** Resolves the target inside the authenticated tenant. */
  private async assertTargetAccessible(
    workspaceId: string,
    target: AttachmentTarget
  ): Promise<void> {
    const id = WorkspaceId.create(workspaceId)

    switch (target.type) {
      case AttachmentTargetType.PROJECT: {
        const project = await this.projects.findByWorkspaceIdAndId({
          workspaceId: id,
          projectId: ProjectId.create(target.id),
        })

        if (!project || project.isDeleted) {
          this.notFound()
        }

        return
      }

      case AttachmentTargetType.WORK_ITEM: {
        const workItem = await this.workItems.findByWorkspaceIdAndId({
          workspaceId: id,
          workItemId: WorkItemId.create(target.id),
        })

        if (!workItem || workItem.isDeleted) {
          this.notFound()
        }

        return
      }

      default:
        this.forbid()
    }
  }

  /** Restricts user-scoped files to their owning account. */
  private assertUserOwnership(actor: FileActor, ownerId: string): void {
    if (actor.userId !== ownerId) {
      this.forbid()
    }
  }

  /** Requires an authenticated workspace context. */
  private requireWorkspaceId(actor: FileActor): string {
    if (!actor.workspaceId) {
      return this.forbid()
    }

    return actor.workspaceId
  }

  private forbid(): never {
    throw new FileApplicationError(
      FileApplicationErrorCode.FORBIDDEN,
      'You do not have permission to access this resource'
    )
  }

  private notFound(): never {
    throw new FileApplicationError(
      FileApplicationErrorCode.NOT_FOUND,
      'Attachment target not found'
    )
  }
}
