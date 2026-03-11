import {
  GetCurrentOrganizationRequestDto,
  GetCurrentOrganizationResponseDto,
} from '../dto'

export interface IGetCurrentOrganization {
  execute(
    dto: GetCurrentOrganizationRequestDto
  ): Promise<GetCurrentOrganizationResponseDto>
}

export const GET_CURRENT_ORGANIZATION = Symbol('IGetCurrentOrganization')
