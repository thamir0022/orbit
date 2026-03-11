import { Inject, Injectable } from '@nestjs/common'
import {
  type IOrganizationRepository,
  ORGANIZATION_REPOSITORY,
} from '../repository/organization.repository.interface'
import { IGetCurrentOrganization } from './get-current-organization.interface'
import {
  GetCurrentOrganizationRequestDto,
  GetCurrentOrganizationResponseDto,
} from '../dto'
import { OrganizationMapper } from '../mappers/organization.mapper'

@Injectable()
export class GetCurrentOrganizationUseCase implements IGetCurrentOrganization {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly _organizationRepository: IOrganizationRepository
  ) {}

  async execute(
    dto: GetCurrentOrganizationRequestDto
  ): Promise<GetCurrentOrganizationResponseDto> {
    const organization = await this._organizationRepository.findBySubdomain(
      dto.subdomain
    )

    if (!organization) throw new Error('Org not found')

    return { organization: OrganizationMapper.toResponseDto(organization) }
  }
}
