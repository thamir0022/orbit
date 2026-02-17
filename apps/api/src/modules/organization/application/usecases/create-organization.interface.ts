import { CreateOrganizationCommand } from '../dto/create-organization.command'

export interface ICreateOrganizationUseCase {
  execute(command: CreateOrganizationCommand): Promise<void>
}

export const CREATE_ORGANIZATION = Symbol('ICreateOrganizationUseCase')
