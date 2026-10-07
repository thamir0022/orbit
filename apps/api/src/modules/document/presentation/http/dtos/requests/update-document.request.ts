import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'

import { DocumentContent } from '../../../../domain/interfaces/document.interface'

/**
 * HTTP request body used to update an existing rich-text document.
 *
 * Only mutable document fields are accepted. Document identity,
 * workspace identity, and actor identity are resolved outside the body.
 */
export class UpdateDocumentRequest {
  @ApiPropertyOptional({
    description: 'Updated document title',
    minLength: 2,
    maxLength: 200,
    example: 'Authentication Architecture v2',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string'
      ? value.normalize('NFKC').trim().replace(/\s+/g, ' ')
      : value
  )
  @IsString({
    message: 'Document title must be a string',
  })
  @MinLength(2, {
    message: 'Document title must be at least 2 characters',
  })
  @MaxLength(200, {
    message: 'Document title must not exceed 200 characters',
  })
  readonly title?: string

  @ApiPropertyOptional({
    description: 'Updated Tiptap JSON document state',
    type: Object,
    example: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Updated document content.',
            },
          ],
        },
      ],
    },
  })
  @IsOptional()
  @IsObject({
    message: 'Document content must be a valid JSON object',
  })
  readonly content?: DocumentContent
}
