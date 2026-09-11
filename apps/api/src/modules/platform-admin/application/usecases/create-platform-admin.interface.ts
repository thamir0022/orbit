import { CreatePlatformAdminInput, CreatePlatformAdminOutput } from '../dtos'

export interface ICreatePlatformAdminUseCase {
  execute(input: CreatePlatformAdminInput): Promise<CreatePlatformAdminOutput>
}

export const CREATE_PLATFORM_ADMIN_USE_CASE = Symbol(
  'CreatePlatformAdminUseCase'
)
