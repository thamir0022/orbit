import { SignInCommand } from '../dto/sign-in.command'
import { SignInResult } from '../dto/sign-in.result'

export interface ISignInWithEmailUseCase {
  excecute(command: SignInCommand): Promise<SignInResult>
}
