import { OrganizationMember } from '../../domain/entities/organization-member.entity'
import { OrganizationMemberModel } from '../../infrastructure/persistence/schema/organization-member.schema'
import { OrganizationMemberStatus } from '../../domain/enums/organization-member-status.enum'
import { OrganizationId } from '../../domain'
import { UserId } from '@/modules/user/domain'

export class OrganizationMemberMapper {
  public static toDomain(raw: OrganizationMemberModel): OrganizationMember {
    return OrganizationMember.reconstitute({
      id: raw.id,
      organizationId: OrganizationId.fromString(raw.organizationId),
      userId: UserId.fromString(raw.userId),
      roleId: raw.roleId,
      status: raw.status as OrganizationMemberStatus,
      invitedBy: raw.invitedBy,
      invitedAt: raw.invitedAt,
      joinedAt: raw.joinedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    })
  }

  public static toPersistence(
    member: OrganizationMember
  ): OrganizationMemberModel {
    return {
      id: member.id,
      organizationId: member.organizationId.value,
      userId: member.userId.value,
      roleId: member.roleId,
      status: member.status,
      invitedBy: member.invitedBy,
      invitedAt: member.invitedAt,
      joinedAt: member.joinedAt,
      // We rely on Mongoose for creating timestamps, but pass them if they exist
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    } as OrganizationMemberModel
  }
}
