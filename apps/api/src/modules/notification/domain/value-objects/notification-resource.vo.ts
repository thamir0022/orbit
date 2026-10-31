import { ValueObject } from '@/shared/domain'
import { UuidUtil } from '@/shared/utils'
import { NotificationResourceType } from '../enums/notification-resource-type.enum'
import { NotificationValidationException } from '../exceptions/notification-validation.exception'

/**
 * Immutable fields identifying a resource referenced by a notification.
 *
 * - type and id identify the canonical resource.
 * - label is an optional display snapshot, not a routing identifier.
 */
export interface NotificationResourceProps {
  readonly type: NotificationResourceType
  readonly id: string
  readonly label?: string
}

/**
 * Stable reference to the primary resource associated with a notification.
 *
 * - Uses a UUID instead of mutable workspace slugs or human-readable keys.
 * - A label can be shown in the inbox when a compact preview is needed.
 * - URL construction and authorization belong outside the domain layer.
 */
export class NotificationResource extends ValueObject<NotificationResourceProps> {
  private static readonly MAX_LABEL_LENGTH = 160

  private constructor(props: NotificationResourceProps) {
    super(props)
  }

  /** Validates and normalizes a reference supplied by an application event. */
  static create(props: NotificationResourceProps): NotificationResource {
    if (
      !props ||
      !Object.values(NotificationResourceType).includes(props.type)
    ) {
      throw new NotificationValidationException('Invalid resource type')
    }

    if (typeof props.id !== 'string' || !UuidUtil.isValid(props.id)) {
      throw new NotificationValidationException('Invalid resource ID')
    }

    if (props.label !== undefined && typeof props.label !== 'string') {
      throw new NotificationValidationException('Invalid resource label')
    }

    const label = props.label?.normalize('NFKC').trim()

    if (
      props.label !== undefined &&
      (!label || label.length > this.MAX_LABEL_LENGTH)
    ) {
      throw new NotificationValidationException('Invalid resource label')
    }

    return new NotificationResource({
      type: props.type,
      id: props.id,
      ...(label ? { label } : {}),
    })
  }

  get type(): NotificationResourceType {
    return this.props.type
  }

  get id(): string {
    return this.props.id
  }

  get label(): string | undefined {
    return this.props.label
  }
}
