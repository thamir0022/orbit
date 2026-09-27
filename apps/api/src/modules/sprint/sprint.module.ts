import { Module } from '@nestjs/common'
import { sprintProviders } from './infrastructure/providers/sprint.provider'
import { MongooseModule } from '@nestjs/mongoose'
import {
  SprintModel,
  SprintSchema,
} from './infrastructure/persistance/mongoose/schemas/sprint.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SprintModel.name,
        schema: SprintSchema,
      },
    ]),
  ],
  providers: [...sprintProviders],
})
export class SprintModule {}
