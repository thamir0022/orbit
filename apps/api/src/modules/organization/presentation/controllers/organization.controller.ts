import { Body, Controller, Inject, Post } from '@nestjs/common'
import { CreateOrganizationDto } from '../dto/create-organization.request.dto'
import {
  CREATE_ORGANIZATION,
  type ICreateOrganizationUseCase,
} from '../../application/usecases/create-organization.interface'
import { ResponseMessage } from '@/shared/presentation/decorators/response-message.decorator'
import { Messages } from '../enums/response-messages.enum'

@Controller('/organization')
export class OrganizationContoller {
  constructor(
    @Inject(CREATE_ORGANIZATION)
    private readonly _createOrganizationUseCase: ICreateOrganizationUseCase
  ) {}

  @Post('/create')
  @ResponseMessage(Messages.ORGANIZATION_CREATED)
  async createOrganization(
    @Body() createOrganizationRequestDto: CreateOrganizationDto
  ) {
    await this._createOrganizationUseCase.execute({
      name: createOrganizationRequestDto.name,
      subdomain: createOrganizationRequestDto.subdomain,
      ownerId: createOrganizationRequestDto.ownerId,
      companyType: createOrganizationRequestDto.companyType,
      companySize: createOrganizationRequestDto.companySize,
    })
  }
}
