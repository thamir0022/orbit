import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AttachmentTarget } from '@/modules/file/domain'
import { AttachFile } from '@/modules/file/application/use-cases/attach-file/attach-file.use-case'
import { ListAttachments } from '@/modules/file/application/use-cases/list-attachments/list-attachments.use-case'
import { RemoveAttachment } from '@/modules/file/application/use-cases/remove-attachment/remove-attachment.use-case'
import type { FileActor } from '@/modules/file/application/ports/file-authorization.port'
import { FilePrincipal } from '../decorators/file-principal.decorator'
import { FileHttpExceptionFilter } from '../filters/file-http-exception.filter'
import { AttachFileRequest } from '../requests/attach-file.request'
import { ListAttachmentsRequest } from '../requests/list-attachments.request'

/** Authorized relationship endpoints; binary objects are managed separately. */
@ApiTags('File Attachments')
@ApiBearerAuth()
@Controller('files/attachments')
@UseFilters(FileHttpExceptionFilter)
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  })
)
export class FileAttachmentController {
  constructor(
    private readonly attach: AttachFile,
    private readonly list: ListAttachments,
    private readonly remove: RemoveAttachment
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Attach a ready workspace file to a business entity',
  })
  attachFile(
    @Body() body: AttachFileRequest,
    @FilePrincipal() actor: FileActor
  ) {
    return this.attach.execute({
      actor,
      fileId: body.fileId,
      target: AttachmentTarget.create(body.targetType, body.targetId),
      placement: body.placement,
      displayName: body.displayName,
    })
  }

  @Get()
  @ApiOperation({
    summary: 'List visible attachments for an authorized business target',
  })
  listFiles(
    @Query() query: ListAttachmentsRequest,
    @FilePrincipal() actor: FileActor
  ) {
    return this.list.execute({
      actor,
      target: AttachmentTarget.create(query.targetType, query.targetId),
      limit: query.limit,
    })
  }

  @Delete(':attachmentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Detach a file from a business entity' })
  removeFile(
    @Param('attachmentId') attachmentId: string,
    @FilePrincipal() actor: FileActor
  ): Promise<void> {
    return this.remove.execute({ actor, attachmentId })
  }
}
