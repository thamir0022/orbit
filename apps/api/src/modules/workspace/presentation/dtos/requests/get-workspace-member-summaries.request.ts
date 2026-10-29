import { Type } from 'class-transformer'
import { IsInt, Max, Min } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

/** Bounds pagination for lightweight member queries. */
export class GetWorkspaceMemberSummariesRequest {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  readonly page: number = 1

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  readonly limit: number = 20
}
