import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import type { InitiateUploadOutput } from '@/modules/file/application/use-cases/initiate-upload/initiate-upload.use-case'

/** Short-lived upload instructions; never persist these fields in MongoDB. */
export class InitiateUploadResponse {
  @ApiProperty() fileId!: string
  @ApiProperty() uploadSessionId!: string
  @ApiProperty({ format: 'date-time' }) expiresAt!: Date
  @ApiProperty({ enum: ['POST', 'PUT'] }) method!: 'POST' | 'PUT'
  @ApiProperty() url!: string
  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: { type: 'string' },
  })
  fields?: Readonly<Record<string, string>>
  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: { type: 'string' },
  })
  headers?: Readonly<Record<string, string>>

  static from(output: InitiateUploadOutput): InitiateUploadResponse {
    return Object.assign(new InitiateUploadResponse(), {
      fileId: output.fileId,
      uploadSessionId: output.uploadSessionId,
      expiresAt: output.expiresAt,
      method: output.upload.method,
      url: output.upload.url,
      ...(output.upload.method === 'POST'
        ? { fields: output.upload.fields }
        : { headers: output.upload.headers }),
    })
  }
}

/** Completion acknowledges staging; it is not an assertion that the content is safe. */
export class CompleteUploadResponse {
  @ApiProperty() fileId!: string
  @ApiProperty({ enum: ['processing'] }) status!: 'processing'
}

/** Response URLs are bearer capabilities and expire quickly. */
export class AuthorizedFileAccessResponse {
  @ApiProperty() url!: string
  @ApiProperty({ format: 'date-time' }) expiresAt!: Date
  @ApiProperty() mimeType!: string
  @ApiProperty() fileName!: string
}
