import { Inject, Injectable, Logger } from '@nestjs/common'
import { ICreateOrganizationUseCase } from './create-organization.interface'
import { CreateOrganizationCommand } from '../dto/create-organization.command'
import {
  type IOrganizationRepository,
  ORGANIZATION_REPOSITORY,
} from '../repository/organization.repository.interface'
import { OrganizationAlreadyExistsException } from '../../domain/exceptions/organization.exception'
import { Organization } from '../../domain'
import { UserId } from '@/modules/user/domain'

@Injectable()
export class CreateOrganizationUseCase implements ICreateOrganizationUseCase {
  private readonly _logger = new Logger(CreateOrganizationUseCase.name)
  constructor(
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly _organizationRepository: IOrganizationRepository
  ) {}

  async execute(command: CreateOrganizationCommand): Promise<void> {
    const existingOrg = await this._organizationRepository.findBySubdomain(
      command.subdomain
    )

    if (existingOrg)
      throw new OrganizationAlreadyExistsException(command.subdomain)

    const newOrg = Organization.create({
      name: command.name,
      subdomain: command.subdomain,
      ownerId: UserId.fromString(command.ownerId),
      companySize: command.companySize,
      companyType: command.companyType,
      defaultPlanId: 'DEFAULT_PLAN_ID',
    })

    await this._organizationRepository.save(newOrg)

    this._logger.log(`Organization created ${newOrg.id.value}`)
  }
}
