import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { authProviders } from './infrastructure/providers/auth.provider'
import { RedisModule } from '@/shared/infrastructure'
import { MongooseModule } from '@nestjs/mongoose'
import { UserModel, UserSchema } from '../user/infrastructure'
import { AuthController } from './presentation/auth.controller'
import { LocalStrategy } from './infrastructure/strategies/local.strategy'

@Module({
  imports: [
    RedisModule,
    PassportModule,
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [...authProviders, LocalStrategy],
})
export class AuthModule {}
