import { SignUpCommand } from '../dto/sign-up.command'
import { SignUpResult } from '../dto/sign-up.result'

export interface ISignUpWithEmailUseCase {
  execute(command: SignUpCommand): Promise<SignUpResult>
}

export const SIGN_UP_WITH_EMAIL = Symbol('ISignInWithEmailUseCase')
