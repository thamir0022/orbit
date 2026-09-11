import { SignUpCompleteInputDto, SignUpCompleteOutputDto } from '../dto'

export interface ISignUpCompleteUseCase {
  execute(input: SignUpCompleteInputDto): Promise<SignUpCompleteOutputDto>
}

export const SIGN_UP_COMPLETE = Symbol('ISignUpCompleteUseCase')
