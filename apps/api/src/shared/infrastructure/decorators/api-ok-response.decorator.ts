import { applyDecorators, Type } from '@nestjs/common'
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger'
import { ApiResponseDto } from '../dtos/api-response.dto'

interface ApiOkResponseGenericOptions<TModel extends Type<any>> {
  type: TModel
  isArray?: boolean
  description?: string
}

export const ApiOkResponseGeneric = <TModel extends Type<any>>(
  options: ApiOkResponseGenericOptions<TModel>
) => {
  return applyDecorators(
    // 1. Register both the Wrapper and the Data DTO so Swagger can "see" them
    ApiExtraModels(ApiResponseDto, options.type),

    // 2. Define the Schema using 'allOf' (Inheritance/Composition)
    ApiOkResponse({
      description: options.description,
      schema: {
        allOf: [
          // Part A: The Base Envelope (success, message, etc.)
          { $ref: getSchemaPath(ApiResponseDto) },

          // Part B: The Specific Data Structure
          {
            properties: {
              data: options.isArray
                ? {
                    type: 'array',
                    items: { $ref: getSchemaPath(options.type) },
                  }
                : {
                    $ref: getSchemaPath(options.type),
                  },
            },
          },
        ],
      },
    })
  )
}
