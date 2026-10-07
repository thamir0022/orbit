import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common'

import {
  CREATE_DOCUMENT_USE_CASE,
  ICreateDocumentUseCase,
} from '../../../application/usecases/create-document'
import { CurrentAuth } from '@/shared/presentation/decorators/current-auth.decorator'
import { AuthContext } from '@/shared/domain/types'

import { CreateDocumentRequest } from '../dtos'

import {
  GET_DOCUMENT_USE_CASE,
  IGetDocumentUseCase,
} from '../../../application/usecases/get-document'

@Controller('documents')
export class DocumentController {
  constructor(
    @Inject(CREATE_DOCUMENT_USE_CASE)
    private readonly createDocumentUseCase: ICreateDocumentUseCase,

    @Inject(GET_DOCUMENT_USE_CASE)
    private readonly getDocumentUseCase: IGetDocumentUseCase
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

  @Get(':documentId')
  async getDocument(
    @CurrentAuth() auth: AuthContext,
    @Param('documentId') documentId: string
  ) {
    return this.getDocumentUseCase.execute({
      workspaceId: auth.workspaceId!,
      documentId,
      actorId: auth.userId,
    })
  }
}
