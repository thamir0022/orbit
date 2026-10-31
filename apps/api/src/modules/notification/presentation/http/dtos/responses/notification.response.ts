import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/** Lightweight actor information attached to a notification. */
export class NotificationActorResponse {
  @ApiProperty({ format: 'uuid' })
  id!: string

  @ApiProperty()
  displayName!: string

  @ApiProperty({ type: String, nullable: true })
  avatarUrl!: string | null
}

/** Stable resource reference attached to a notification. */
export class NotificationResourceResponse {
  @ApiProperty()
  type!: string

  @ApiProperty({ format: 'uuid' })
  id!: string

  @ApiPropertyOptional()
  label?: string

  @ApiProperty({
    description: 'Permanent internal resource navigation URL.',
    example: '/r/work-item/019c74bd-9862-7369-b600-0eed36827f90',
  })
  href!: string
}

/** Public notification item returned by inbox queries. */
export class NotificationListItemResponse {
  @ApiProperty({ format: 'uuid' })
  id!: string

  @ApiProperty({ type: String, nullable: true, format: 'uuid' })
  workspaceId!: string | null

  @ApiProperty({ format: 'uuid' })
  recipientId!: string

  @ApiProperty({
    type: () => NotificationActorResponse,
    nullable: true,
  })
  actor!: NotificationActorResponse | null

  @ApiProperty()
  type!: string

  @ApiProperty()
  title!: string

  @ApiProperty({
    description: 'Markdown notification content.',
  })
  message!: string

  @ApiProperty({
    type: () => NotificationResourceResponse,
    nullable: true,
  })
  resource!: NotificationResourceResponse | null

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    nullable: true,
    description: 'Optional versioned notification metadata.',
  })
  metadata!: Record<string, unknown> | null

  @ApiProperty({
    type: String,
    format: 'date-time',
    nullable: true,
  })
  readAt!: Date | null

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date
}

/** Cursor-paginated notification inbox response. */
export class NotificationPageResponse {
  @ApiProperty({
    type: () => [NotificationListItemResponse],
  })
  items!: NotificationListItemResponse[]

  @ApiProperty({
    type: String,
    nullable: true,
  })
  nextCursor!: string | null

  @ApiProperty()
  hasNextPage!: boolean
}

/** Response containing the unread notification count. */
export class NotificationUnreadCountResponse {
  @ApiProperty({
    minimum: 0,
    example: 5,
  })
  count!: number
}
