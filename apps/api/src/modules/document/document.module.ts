import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import {
  DocumentModel,
  DocumentSchema,
} from './infrastructure/persistance/mongoose/schemas/document.schema'
import { documentProviders } from './infrastructure/providers/document.providers'

import { DocumentController } from './presentation/http/controllers/document.controller'

import { WorkspaceModule } from '../workspace/workspace.module'

import {
  CREATE_DOCUMENT_USE_CASE,
  CreateDocumentUseCase,
} from './application/usecases/create-document'
import {
  GET_DOCUMENT_USE_CASE,
  GetDocumentUseCase,
} from './application/usecases/get-document'
import {
  UPDATE_DOCUMENT_USE_CASE,
  UpdateDocumentUseCase,
} from './application/usecases/update-document'
import {
  DELETE_DOCUMENT_USE_CASE,
  DeleteDocumentUseCase,
} from './application/usecases/delete-document'
import {
  GET_DOCUMENTS_USE_CASE,
  GetDocumentsUseCase,
} from './application/usecases/get-documents'

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
    {
      provide: GET_DOCUMENT_USE_CASE,
      useClass: GetDocumentUseCase,
    },
    {
      provide: UPDATE_DOCUMENT_USE_CASE,
      useClass: UpdateDocumentUseCase,
    },
    {
      provide: DELETE_DOCUMENT_USE_CASE,
      useClass: DeleteDocumentUseCase,
    },
    {
      provide: GET_DOCUMENTS_USE_CASE,
      useClass: GetDocumentsUseCase,
    },
  ],
})
export class DocumentModule {}
