import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Query,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger'

import { CurrentAuth } from '@/shared/presentation/decorators/current-auth.decorator'
import { ResponseMessage } from '@/shared/presentation/decorators/response-message.decorator'
import { ApiResponseDto } from '@/shared/presentation/dtos/responses/api-response.dto'

import type { NotificationPageOutput } from '../../../application/contracts/notification-list-item.output'
import {
  GET_NOTIFICATIONS_USE_CASE,
  type IGetNotificationsUseCase,
} from '../../../application/use-cases/get-notifications'
import {
  GET_UNREAD_COUNT_USE_CASE,
  type IGetUnreadCountUseCase,
  type GetUnreadCountOutput,
} from '../../../application/use-cases/get-unread-count'
import {
  MARK_NOTIFICATION_READ_USE_CASE,
  type IMarkNotificationReadUseCase,
} from '../../../application/use-cases/mark-notification-read'

import { GetNotificationsQuery } from '../dtos/requests/get-notifications.query'
import { NotificationIdParams } from '../dtos/requests/notification-id.params'
import {
  NotificationPageResponse,
  NotificationUnreadCountResponse,
} from '../dtos/responses/notification.response'
import { NotificationResponseMessage } from '../../enums/response-message.enum'

/**
 * Authenticated notification inbox HTTP controller.
 *
 * - Derives recipient identity from the authenticated request.
 * - Delegates business operations to application use cases.
 * - Returns responses through Orbit's global response interceptor.
 */
@ApiTags('Notifications')
@ApiExtraModels(
  ApiResponseDto,
  NotificationPageResponse,
  NotificationUnreadCountResponse
)
@Controller('notifications')
export class NotificationController {
  constructor(
    @Inject(GET_NOTIFICATIONS_USE_CASE)
    private readonly getNotificationsUseCase: IGetNotificationsUseCase,

    @Inject(GET_UNREAD_COUNT_USE_CASE)
    private readonly getUnreadCountUseCase: IGetUnreadCountUseCase,

    @Inject(MARK_NOTIFICATION_READ_USE_CASE)
    private readonly markNotificationReadUseCase: IMarkNotificationReadUseCase
  ) {}

  /**
   * GET /notifications
   *
   * Retrieves a cursor-paginated inbox for the authenticated recipient.
   */
  @Get()
  @ResponseMessage(NotificationResponseMessage.NOTIFICATIONS_FETCHED)
  @ApiOperation({
    summary: 'Retrieve notifications',
    description:
      'Returns newest-first notifications belonging to the authenticated user.',
  })
  @ApiOkResponse({
    description: 'Notifications retrieved successfully.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              $ref: getSchemaPath(NotificationPageResponse),
            },
          },
        },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid pagination or filter parameters.',
  })
  getNotifications(
    @CurrentAuth('userId') recipientId: string,
    @Query() query: GetNotificationsQuery
  ): Promise<NotificationPageOutput> {
    return this.getNotificationsUseCase.execute({
      recipientId,
      limit: query.limit,
      cursor: query.cursor,
      unreadOnly: query.unread === 'true',
    })
  }

  /**
   * GET /notifications/unread-count
   *
   * Returns the recipient's total number of unread notifications.
   */
  @Get('unread-count')
  @ResponseMessage(NotificationResponseMessage.UNREAD_COUNT_FETCHED)
  @ApiOperation({
    summary: 'Retrieve unread notification count',
    description:
      'Counts non-expired unread notifications for the authenticated user.',
  })
  @ApiOkResponse({
    description: 'Unread count retrieved successfully.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              $ref: getSchemaPath(NotificationUnreadCountResponse),
            },
          },
        },
      ],
    },
  })
  getUnreadCount(
    @CurrentAuth('userId') recipientId: string
  ): Promise<GetUnreadCountOutput> {
    return this.getUnreadCountUseCase.execute({
      recipientId,
    })
  }

  /**
   * PATCH /notifications/:id/read
   *
   * Marks an accessible notification as read.
   */
  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(NotificationResponseMessage.NOTIFICATION_MARKED_READ)
  @ApiOperation({
    summary: 'Mark notification as read',
    description:
      'Idempotently marks a recipient-owned, non-expired notification as read.',
  })
  @ApiOkResponse({
    description: 'Notification marked as read successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid notification identifier.',
  })
  @ApiNotFoundResponse({
    description: 'Notification not found or not accessible.',
  })
  async markRead(
    @CurrentAuth('userId') recipientId: string,
    @Param() params: NotificationIdParams
  ): Promise<void> {
    await this.markNotificationReadUseCase.execute({
      notificationId: params.id,
      recipientId,
    })
  }
}
