import { Global, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { BcryptPasswordHasher } from './hashing/bcrypt-password-hasher.service'
import { JwtTokenGenerator } from './tokens/jwt-token-generator.service'
import { RefreshTokenGuard } from './guards/refresh-token.guard'
import { AccessTokenGuard } from './guards/access-token.guard'
import { PASSWORD_HASHER } from '../../application/ports/password-hasher.interface'
import { TOKEN_GENERATOR } from '../../application/ports/token-generator.interface'

@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: TOKEN_GENERATOR,
      useClass: JwtTokenGenerator,
    },
    RefreshTokenGuard,
    AccessTokenGuard,
  ],
  exports: [
    PASSWORD_HASHER,
    TOKEN_GENERATOR,
    RefreshTokenGuard,
    AccessTokenGuard,
  ],
})
export class SecurityModule {}
