import { SignInCommand } from '../dto/sign-in.command'
import { SignInResult } from '../dto/sign-in.result'

export interface ISignInWithEmailUseCase {
  execute(command: SignInCommand): Promise<SignInResult>
}

export const SIGN_IN_WITH_EMAIL = Symbol('ISignInWithEmailUseCase')
