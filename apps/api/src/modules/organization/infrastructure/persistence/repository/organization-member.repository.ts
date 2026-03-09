import {
  OrganizationMemberModel,
  OrganizationMemberDocument,
} from './../schema/organization-member.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { IOrganizationMemberRepository } from '@/modules/organization/application/repository/organization-member.repository.interface'
import { OrganizationMember } from '@/modules/organization/domain/entities/organization-member.entity'
import { OrganizationMemberMapper } from '@/modules/organization/application/mappers/organization-member.mapper'
import { ITransactionOptions } from '@/shared/application/repository/transaction-manager.interface'

@Injectable()
export class OrganizationMemberRepository implements IOrganizationMemberRepository {
  constructor(
    @InjectModel(OrganizationMemberModel.name)
    private readonly _memberModel: Model<OrganizationMemberDocument>
  ) {}

  async findById(id: string): Promise<OrganizationMember | null> {
    return this._memberModel.findOne({ id })
  }

  async delete(id: string, options?: ITransactionOptions): Promise<void> {
    await this._memberModel.deleteOne({ id }, { session: options?.session })
  }

  async save(
    member: OrganizationMember,
    options?: ITransactionOptions
  ): Promise<void> {
    const persistenceData = OrganizationMemberMapper.toPersistence(member)

    // Upsert logic: if it exists, update it; if not, create it.
    // This safely handles both new entity creation and domain behavior updates.
    await this._memberModel
      .updateOne(
        { id: persistenceData.id },
        { $set: persistenceData },
        { upsert: true, session: options?.session }
      )
      .exec()
  }

  async findByOrganizationAndUserId(
    organizationId: string,
    userId: string
  ): Promise<OrganizationMember | null> {
    const document = await this._memberModel
      .findOne({ organizationId, userId })
      .exec()

    if (!document) {
      return null
    }

    return OrganizationMemberMapper.toDomain(document.toObject())
  }
}
