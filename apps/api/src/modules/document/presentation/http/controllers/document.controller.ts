import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common'

import { CurrentAuth } from '@/shared/presentation/decorators/current-auth.decorator'
import { AuthContext } from '@/shared/domain/types'

import {
  CreateDocumentRequest,
  GetDocumentsResponse,
  UpdateDocumentRequest,
  UpdateDocumentResponse,
} from '../dtos'

import {
  CREATE_DOCUMENT_USE_CASE,
  ICreateDocumentUseCase,
} from '../../../application/usecases/create-document'
import {
  GET_DOCUMENT_USE_CASE,
  IGetDocumentUseCase,
} from '../../../application/usecases/get-document'
import {
  IUpdateDocumentUseCase,
  UPDATE_DOCUMENT_USE_CASE,
} from '../../../application/usecases/update-document'
import {
  DELETE_DOCUMENT_USE_CASE,
  IDeleteDocumentUseCase,
} from '../../../application/usecases/delete-document'
import {
  GET_DOCUMENTS_USE_CASE,
  IGetDocumentsUseCase,
} from '@/modules/document/application/usecases/get-documents'

@Controller('documents')
export class DocumentController {
  constructor(
    @Inject(CREATE_DOCUMENT_USE_CASE)
    private readonly createDocumentUseCase: ICreateDocumentUseCase,

    @Inject(GET_DOCUMENT_USE_CASE)
    private readonly getDocumentUseCase: IGetDocumentUseCase,

    @Inject(UPDATE_DOCUMENT_USE_CASE)
    private readonly updateDocumentUseCase: IUpdateDocumentUseCase,

    @Inject(DELETE_DOCUMENT_USE_CASE)
    private readonly deleteDocumentUseCase: IDeleteDocumentUseCase,

    @Inject(GET_DOCUMENTS_USE_CASE)
    private readonly getDocumentsUseCase: IGetDocumentsUseCase
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

  @Patch(':documentId')
  async updateDocument(
    @CurrentAuth() auth: AuthContext,
    @Param('documentId') documentId: string,
    @Body() request: UpdateDocumentRequest
  ): Promise<UpdateDocumentResponse> {
    const { title, content } = request

    return this.updateDocumentUseCase.execute({
      workspaceId: auth.workspaceId!,
      actorId: auth.userId,
      documentId,
      title,
      content,
    })
  }

  @Delete(':documentId')
  async deleteDocument(
    @CurrentAuth() auth: AuthContext,
    @Param('documentId') documentId: string
  ): Promise<void> {
    return this.deleteDocumentUseCase.execute({
      workspaceId: auth.workspaceId!,
      actorId: auth.userId,
      documentId,
    })
  }

  @Get()
  async getDocuments(
    @CurrentAuth() auth: AuthContext
  ): Promise<GetDocumentsResponse> {
    return this.getDocumentsUseCase.execute({
      workspaceId: auth.workspaceId!,
      actorId: auth.userId,
    })
  }
}
