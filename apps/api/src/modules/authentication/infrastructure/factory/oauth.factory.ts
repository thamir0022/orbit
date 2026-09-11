import { Injectable } from '@nestjs/common'
import { IOAuthFactory, IOAuthProvider } from '../../application'
import { GoogleOAuthProvider } from '../providers/google.provider'
import { AuthProvider } from '@/modules/user/domain'

@Injectable()
export class OAuthFactory implements IOAuthFactory {
  constructor(private readonly _googleOAuthProvider: GoogleOAuthProvider) {}

  getProvider(provider: AuthProvider): IOAuthProvider {
    switch (provider) {
      case AuthProvider.GOOGLE:
        return this._googleOAuthProvider

      default:
        throw new Error() // Throw a specific error
    }
  }
}
