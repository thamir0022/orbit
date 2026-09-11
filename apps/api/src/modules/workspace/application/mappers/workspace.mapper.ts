import {
  Workspace,
  WorkspaceId,
  WorkspaceProps,
  WorkspaceSettings,
  WorkspaceAddress,
  WorkspaceContact,
  WorkspaceVerification,
} from '@/modules/workspace/domain'
import { UserId } from '@/modules/user/domain'
import { type WorkspaceDocument } from '../../infrastructure/persistence/schema/workspace.schema'
import { WorkspaceDto } from '@/shared/domain/types'

export class WorkspaceMapper {
  static toOutputDto(workspace: Workspace): WorkspaceDto {
    return {
      id: workspace.id.value,
      name: workspace.name,
      slug: workspace.slug,
      ownerId: workspace.ownerId.value,
      planId: workspace.planId,
      companySize: workspace.companySize,
      companyType: workspace.companyType,
      settings: workspace.settings.toPrimitives(),
      location: workspace.location.toPrimitives(),
      contactInfo: workspace.contactInfo.toPrimitives(),
      verification: workspace.verification.toPrimitives(),
      status: workspace.status,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    }
  }

  static toPersistence(workspace: Workspace): Partial<WorkspaceDocument> {
    return {
      id: workspace.id.value,
      name: workspace.name,
      slug: workspace.slug,
      ownerId: workspace.ownerId.value,
      planId: workspace.planId,
      companySize: workspace.companySize,
      companyType: workspace.companyType,
      subscriptionId: workspace.subscriptionId ?? undefined,
      trialEndsAt: workspace.trialEndsAt,
      settings: workspace.settings.toPersistence(),
      location: workspace.location.toPersistence(),
      contactInfo: workspace.contactInfo.toPersistence(),
      verification: workspace.verification.toPersistence(),
      status: workspace.status,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      deletedAt: workspace.deletedAt,
    }
  }

  static toDomain(document: WorkspaceDocument): Workspace {
    const props: WorkspaceProps = {
      id: WorkspaceId.fromString(document.id.toString()),
      name: document.name,
      slug: document.slug,
      ownerId: UserId.fromString(document.ownerId),
      companySize: document.companySize,
      companyType: document.companyType,
      planId: document.planId,
      subscriptionId: document.subscriptionId,
      trialEndsAt: document.trialEndsAt,
      settings: WorkspaceSettings.fromPersistence(document.settings),
      location: WorkspaceAddress.fromPersistence(document.location),
      contactInfo: WorkspaceContact.fromPersistence(document.contactInfo),
      verification: WorkspaceVerification.fromPersistence(
        document.verification
      ),
      status: document.status,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      deletedAt: document.deletedAt,
    }

    return Workspace.reconstitute(props)
  }
}
