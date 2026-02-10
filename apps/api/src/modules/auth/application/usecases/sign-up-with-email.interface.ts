import { SignUpResult } from '../dto/sign-up.result'

export interface ISignInWithEmailUseCase {
  execute(): Promise<SignUpResult>
}
