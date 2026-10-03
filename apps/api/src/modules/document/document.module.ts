import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import {
  DocumentModel,
  DocumentSchema,
} from './infrastructure/persistance/mongoose/schemas/document.schema'
import { documentProviders } from './infrastructure/providers/document.providers'

import { DocumentController } from './presentation/http/controllers/document.controller'

import {
  CREATE_DOCUMENT_USE_CASE,
  CreateDocumentUseCase,
} from './application/usecases/create-document'
import { WorkspaceModule } from '../workspace/workspace.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: DocumentModel.name,
        schema: DocumentSchema,
      },
    ]),

    WorkspaceModule,
  ],
  controllers: [DocumentController],
  providers: [
    ...documentProviders,
    {
      provide: CREATE_DOCUMENT_USE_CASE,
      useClass: CreateDocumentUseCase,
    },
  ],
})
export class DocumentModule {}
