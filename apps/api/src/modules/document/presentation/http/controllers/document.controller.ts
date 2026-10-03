import { Body, Controller, Inject, Post } from '@nestjs/common'

import {
  CREATE_DOCUMENT_USE_CASE,
  ICreateDocumentUseCase,
} from '../../../application/usecases/create-document'
import { CurrentAuth } from '@/shared/presentation/decorators/current-auth.decorator'
import { AuthContext } from '@/shared/domain/types'
import { CreateDocumentRequest } from '../dtos'

@Controller('documents')
export class DocumentController {
  constructor(
    @Inject(CREATE_DOCUMENT_USE_CASE)
    private readonly createDocumentUseCase: ICreateDocumentUseCase
  ) {}

  @Post()
  async createDocument(
    @CurrentAuth() auth: AuthContext,
    @Body() request: CreateDocumentRequest
  ) {
    const { title, content } = request

    return this.createDocumentUseCase.execute({
      workspaceId: auth.workspaceId!,
      actorId: auth.userId,
      title,
      content,
    })
  }
}
