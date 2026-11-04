import { ApiProperty } from '@nestjs/swagger'
import type { InitiateUploadOutput } from '@/modules/file/application/use-cases/initiate-upload/initiate-upload.use-case'

/** Short-lived signed POST instructions; never persist these fields in MongoDB. */
export class InitiateUploadResponse {
  @ApiProperty() fileId!: string
  @ApiProperty() uploadSessionId!: string
  @ApiProperty({ format: 'date-time' }) expiresAt!: Date
  @ApiProperty({ enum: ['POST'] }) method!: 'POST'
  @ApiProperty() url!: string
  @ApiProperty({ type: 'object', additionalProperties: { type: 'string' } })
  fields!: Readonly<Record<string, string>>

  static from(output: InitiateUploadOutput): InitiateUploadResponse {
    return Object.assign(new InitiateUploadResponse(), {
      fileId: output.fileId,
      uploadSessionId: output.uploadSessionId,
      expiresAt: output.expiresAt,
      method: output.upload.method,
      url: output.upload.url,
      fields: output.upload.fields,
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
