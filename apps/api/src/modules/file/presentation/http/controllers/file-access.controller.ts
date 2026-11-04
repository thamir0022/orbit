import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { GetAuthorizedAccess } from '@/modules/file/application/use-cases/get-authorized-access/get-authorized-access.use-case'
import type { FileActor } from '@/modules/file/application/ports/file-authorization.port'
import { FilePrincipal } from '../decorators/file-principal.decorator'
import { FileHttpExceptionFilter } from '../filters/file-http-exception.filter'
import { GetFileAccessRequest } from '../requests/get-file-access.request'
import { AuthorizedFileAccessResponse } from '../responses/file-upload.response'

/** Authorization gateway; it never streams arbitrary private storage keys on user input. */
@ApiTags('Files')
@ApiBearerAuth()
@Controller('files')
@UseFilters(FileHttpExceptionFilter)
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  })
)
export class FileAccessController {
  constructor(private readonly access: GetAuthorizedAccess) {}

  @Get(':fileId/access')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Authorize a short-lived private file download' })
  @ApiResponse({ status: 200, type: AuthorizedFileAccessResponse })
  getAccess(
    @Param('fileId') fileId: string,
    @Query() query: GetFileAccessRequest,
    @FilePrincipal() actor: FileActor
  ): Promise<AuthorizedFileAccessResponse> {
    return this.access.execute({
      fileId,
      actor,
      attachmentId: query.attachmentId,
      disposition: query.disposition,
    })
  }
}
