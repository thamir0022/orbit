import { IOrganizationRepository } from '@/modules/organization/application'
import { Organization } from '@/modules/organization/domain'
import { OrganizationId } from '@/modules/organization/domain'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
  OrganizationDocument,
  OrganizationModel,
} from '../schema/organization.schema'
import { OrganizationMapper } from '@/modules/organization/application/mappers/organization.mapper'
import { Logger } from '@nestjs/common'

export class OrganizationRepository implements IOrganizationRepository {
  private readonly logger = new Logger(OrganizationRepository.name)
  constructor(
    @InjectModel(OrganizationModel.name)
    private readonly _organizationModel: Model<OrganizationDocument>
  ) {}

  async findById(id: OrganizationId): Promise<Organization | null> {
    const document = await this._organizationModel.findOne({
      id: id.value,
      deletedAt: null,
    })

    if (!document) return null

    return OrganizationMapper.toDomain(document)
  }

  async save(org: Organization): Promise<Organization> {
    const persistenceData = OrganizationMapper.toPersistence(org)

    const existingOrg = await this._organizationModel.findOne({
      id: org.id.value,
    })

    if (existingOrg) {
      await this._organizationModel.updateOne(
        { id: org.id.value },
        { $set: persistenceData }
      )
      this.logger.debug(`Updated organization: ${org.id.value}`)
    } else {
      const newOrg = new this._organizationModel(persistenceData)
      await newOrg.save()
      this.logger.debug(`Created organization: ${org.id.value}`)
    }

    return org
  }

  async findBySubdomain(subdomain: string): Promise<Organization | null> {
    const document = await this._organizationModel.findOne({
      subdomain,
      deletedAt: null,
    })

    if (!document) return null

    return OrganizationMapper.toDomain(document)
  }

  async delete(id: OrganizationId): Promise<void> {
    await this._organizationModel.findOneAndDelete({
      id: id.value,
      deletedAt: null,
    })
  }
}
