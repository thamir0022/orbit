import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  IsDefined,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'

import { DocumentContent } from '../../../../domain/interfaces/document.interface'

/**
 * HTTP request body used to create a new rich-text document.
 *
 * Editor-specific schema validation remains the responsibility of Tiptap,
 * while the API validates only the fields and boundaries owned by Orbit.
 */
export class CreateDocumentRequest {
  @ApiPropertyOptional({
    description: 'Document title. Defaults to "Untitled" when omitted.',
    minLength: 2,
    maxLength: 200,
    example: 'Authentication Architecture',
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

  @ApiProperty({
    description: 'Tiptap JSON document state.',
    example: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Hello Orbit',
            },
          ],
        },
      ],
    },
  })
  @IsDefined({
    message: 'Document content is required',
  })
  @IsObject({
    message: 'Document content must be a valid JSON object',
  })
  readonly content!: DocumentContent
}
