import { Strategy } from 'passport-local'
import { PassportStrategy } from '@nestjs/passport'
import { Inject, Injectable } from '@nestjs/common'
import { AUTH_SERVICE, type IAuthService } from '../../application'
import { User } from '@/modules/user/domain'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService
  ) {
    super({ usernameField: 'email' })
  }

  async validate(email: string, pass: string): Promise<User> {
    return this.authService.validateUser(email, pass)
  }
}
