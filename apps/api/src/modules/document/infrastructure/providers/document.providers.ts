import { Provider } from '@nestjs/common'

import { DOCUMENT_REPOSITORY } from '../../application/ports/document-repository.port'
import { MongoDocumentRepository } from '../persistance/mongoose/adaptors/mongo-document-repository.adaptor'

import { DOCUMENT_QUERY_REPOSITORY } from '../../application/ports/document-query-repository.port'
import { MongoDocumentQueryRepository } from '../persistance/mongoose/adaptors/mongo-document-query-repository.adaptor'

export const documentProviders: Provider[] = [
  {
    provide: DOCUMENT_REPOSITORY,
    useClass: MongoDocumentRepository,
  },
  {
    provide: DOCUMENT_QUERY_REPOSITORY,
    useClass: MongoDocumentQueryRepository,
  },
]
