import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { AttachmentTarget } from '@/modules/file/domain'
import { InitiateUpload } from '@/modules/file/application/use-cases/initiate-upload/initiate-upload.use-case'
import { CompleteUpload } from '@/modules/file/application/use-cases/complete-upload/complete-upload.use-case'
import { GetUploadStatus } from '@/modules/file/application/use-cases/get-upload-status/get-upload-status.use-case'
import {
  FileApplicationError,
  FileApplicationErrorCode,
} from '@/modules/file/application/errors/file-application.error'
import { FileUploadPurpose } from '@/modules/file/application/ports/file-upload-policy.port'
import { FilePrincipal } from '../decorators/file-principal.decorator'
import { FileHttpExceptionFilter } from '../filters/file-http-exception.filter'
import { InitiateUploadRequest } from '../requests/initiate-upload.request'
import {
  CompleteUploadResponse,
  InitiateUploadResponse,
} from '../responses/file-upload.response'
import type { FileActor } from '@/modules/file/application/ports/file-authorization.port'

/** Authenticated, workspace-aware client endpoints for staging uploads. */
@ApiTags('Files')
@ApiBearerAuth()
@Controller('files/uploads')
@UseFilters(FileHttpExceptionFilter)
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  })
)
export class FileUploadController {
  constructor(
    private readonly initiate: InitiateUpload,
    private readonly complete: CompleteUpload,
    private readonly status: GetUploadStatus
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: InitiateUploadRequest })
  @ApiOperation({ summary: 'Initiate a short-lived private file upload' })
  @ApiResponse({ status: 201, type: InitiateUploadResponse })
  async initiateUpload(
    @Body() body: InitiateUploadRequest,
    @FilePrincipal() actor: FileActor
  ): Promise<InitiateUploadResponse> {
    const targetIsRequired = [
      FileUploadPurpose.ATTACHMENT,
      FileUploadPurpose.INLINE,
    ].includes(body.purpose)
    if (targetIsRequired && (!body.targetType || !body.targetId)) {
      throw new FileApplicationError(
        FileApplicationErrorCode.INVALID_REQUEST,
        'An attachment target is required'
      )
    }
    if (Boolean(body.targetType) !== Boolean(body.targetId)) {
      throw new FileApplicationError(
        FileApplicationErrorCode.INVALID_REQUEST,
        'Both attachment target fields are required'
      )
    }
    const target =
      body.targetType && body.targetId
        ? AttachmentTarget.create(body.targetType, body.targetId)
        : null
    const result = await this.initiate.execute({
      actor,
      scope: body.scope,
      purpose: body.purpose,
      originalName: body.originalName,
      mimeType: body.mimeType,
      sizeBytes: body.sizeBytes,
      target,
    })
    return InitiateUploadResponse.from(result)
  }

  @Get(':sessionId')
  @ApiOperation({ summary: 'Get the upload and processing status' })
  getUploadStatus(
    @Param('sessionId') sessionId: string,
    @FilePrincipal() actor: FileActor
  ) {
    return this.status.execute({ sessionId, actor })
  }

  @Post(':sessionId/complete')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Confirm uploaded staging object and queue verification',
  })
  @ApiResponse({ status: 202, type: CompleteUploadResponse })
  completeUpload(
    @Param('sessionId') sessionId: string,
    @FilePrincipal() actor: FileActor
  ): Promise<CompleteUploadResponse> {
    return this.complete.execute({ sessionId, actor })
  }
}
