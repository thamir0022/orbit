import { SignUpCompleteRequestDto, SignUpCompleteResponseDto } from '../dto'

export interface ISignUpCompleteUseCase {
  execute(dto: SignUpCompleteRequestDto): Promise<SignUpCompleteResponseDto>
}

export const SIGN_UP_COMPLETE = Symbol('ISignUpCompleteUseCase')
