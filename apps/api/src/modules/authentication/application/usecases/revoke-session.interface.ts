import { RevokeSessionInputDto } from '../dto'

export interface IRevokeSessionUseCase {
  execute(input: RevokeSessionInputDto): Promise<void>
}

export const REVOKE_SESSION = Symbol('IRevokeSessionUseCase')
