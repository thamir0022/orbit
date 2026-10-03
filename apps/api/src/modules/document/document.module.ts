import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  DocumentModel,
  DocumentSchema,
} from './infrastructure/persistance/mongoose/schemas/document.schema'
import { documentProviders } from './infrastructure/providers/document.providers'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: DocumentModel.name,
        schema: DocumentSchema,
      },
    ]),
  ],
  providers: [...documentProviders],
})
export class DocumentModule {}
