import { Module, Global } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  type IMongoConfig,
  MONGODB_CONFIG,
} from '../interfaces/mongodb.config.interface'

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [MONGODB_CONFIG],
      useFactory: (config: IMongoConfig) => ({
        uri: config.mongoDbURI,
        dbName: config.mongoDbName,
      }),
    }),
  ],
  exports: [MongooseModule],
})
export class MongoDbModule {}
