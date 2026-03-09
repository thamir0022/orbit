import { SignUpInititateWithEmailRequestDto } from '../dto'

export interface ISignUpInitiateWithEmailUseCase {
  execute(dto: SignUpInititateWithEmailRequestDto): Promise<null>
}

export const SIGN_UP_INITIATE = Symbol('ISignUpInitiateWithEmailUseCase')
