import {
  Organization,
  OrganizationId,
  OrganizationProps,
  OrganizationSettings,
  OrganizationAddress,
  OrganizationContact,
  OrganizationVerification,
  CompanySize,
  CompanyType,
  OrganizationStatus,
} from '@/modules/organization/domain'
import { UserId } from '@/modules/user/domain'
import { type OrganizationDocument } from '../../infrastructure/persistence/schema/organization.schema'
import { OrganizationDto } from '@/shared/domain/types'

/**
 * Organization Mapper
 * Transforms between domain entities, persistence models, and DTOs
 */
export class OrganizationMapper {
  /**
   * Map domain entity to response DTO
   */
  static toResponseDto(org: Organization): OrganizationDto {
    return {
      id: org.id.value,
      name: org.name,
      subdomain: org.subdomain,
      ownerId: org.ownerId.value,
      planId: org.planId,
      companySize: org.companySize,
      companyType: org.companyType,
      settings: org.settings.toPrimitives(),
      location: org.location.toPrimitives(),
      contactInfo: org.contactInfo.toPrimitives(),
      verification: org.verification.toPrimitives(),
      status: org.status,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    }
  }

  /**
   * Map domain entity to persistence model
   */
  static toPersistence(org: Organization): Partial<OrganizationDocument> {
    return {
      id: org.id.value,
      name: org.name,
      subdomain: org.subdomain,
      ownerId: org.ownerId.value,
      planId: org.planId,
      companySize: org.companySize,
      companyType: org.companyType,
      subscriptionId: org.subscriptionId ?? undefined,
      trialEndsAt: org.trialEndsAt,
      settings: org.settings.toPersistence(),
      location: org.location.toPersistence(),
      contactInfo: org.contactInfo.toPersistence(),
      verification: org.verification.toPersistence(),
      status: org.status,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
      deletedAt: org.deletedAt,
    }
  }

  /**
   * Map persistence model to domain entity
   */
  static toDomain(document: OrganizationDocument): Organization {
    const props: OrganizationProps = {
      id: OrganizationId.fromString(document.id),
      name: document.name,
      subdomain: document.subdomain,
      ownerId: UserId.fromString(document.ownerId),
      companySize: document.companySize as CompanySize,
      companyType: document.companyType as CompanyType,
      planId: document.planId,
      subscriptionId: document.subscriptionId,
      trialEndsAt: document.trialEndsAt,
      settings: OrganizationSettings.create(document.settings),
      location: OrganizationAddress.create(document.location),
      contactInfo: OrganizationContact.fromPersistence(document.contactInfo),
      verification: OrganizationVerification.fromPersistence(
        document.verification
      ),
      status: document.status as OrganizationStatus,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      deletedAt: document.deletedAt,
    }

    return Organization.reconstitute(props)
  }
}
