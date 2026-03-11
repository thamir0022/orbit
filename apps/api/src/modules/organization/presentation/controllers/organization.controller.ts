import { Controller, Get, Inject } from '@nestjs/common'
import { ResponseMessage } from '@/shared/presentation/decorators/response-message.decorator'
import { Messages } from '../enums/response-messages.enum'
import {
  GET_CURRENT_ORGANIZATION,
  type IGetCurrentOrganization,
} from '../../application/usecases/get-current-organization.interface'
import { CurrentUser } from '@/shared/presentation/decorators/current-user.decorator'
import { TenantId } from '@/shared/presentation/decorators/tenant-id.decorator'
import { GetCurrentOrganizationResponseDto } from '../../application/dto'

@Controller('organizations')
export class OrganizationController {
  constructor(
    @Inject(GET_CURRENT_ORGANIZATION)
    private readonly _getCurrentOrganization: IGetCurrentOrganization
  ) {}

  @Get('current')
  @ResponseMessage(Messages.GET_ORGANIZATION_SUCCESS)
  async createOrganization(
    @TenantId() subdomain: string,
    @CurrentUser('id') userId: string
  ): Promise<GetCurrentOrganizationResponseDto> {
    return await this._getCurrentOrganization.execute({ userId, subdomain })
  }
}
