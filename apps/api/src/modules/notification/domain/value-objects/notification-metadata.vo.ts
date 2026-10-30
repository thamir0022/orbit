import { ValueObject } from '@/shared/domain'
import { NotificationResourceType } from '../enums/notification-resource-type.enum'
import { NotificationValidationException } from '../exceptions/notification-validation.exception'
import type {
  NotificationAction,
  NotificationMetadataProps,
  NotificationMetadataValue,
} from '../interfaces/notification-metadata.interface'
import { NotificationResource } from './notification-resource.vo'

/**
 * Immutable, validated metadata associated with a notification.
 *
 * - Supports optional navigation actions and custom JSON data.
 * - Keeps structured metadata separate from Markdown content.
 * - Enforces validation and size limits at the domain boundary.
 * - Returns defensive copies to prevent external mutations.
 */
export class NotificationMetadata extends ValueObject<NotificationMetadataProps> {
  private static readonly MAX_SIZE_BYTES = 16_384
  private static readonly MAX_ACTIONS = 5

  private constructor(props: NotificationMetadataProps) {
    super(props)
  }

  /**
   * Creates a validated, detached metadata snapshot.
   *
   * - Ensures JSON serialization.
   * - Validates supported metadata fields.
   * - Prevents oversized metadata.
   */
  static create(props: NotificationMetadataProps): NotificationMetadata {
    if (!this.isRecord(props)) {
      throw new NotificationValidationException('Invalid notification metadata')
    }

    let serialized: string | undefined

    try {
      serialized = JSON.stringify(props)
    } catch {
      throw new NotificationValidationException(
        'Metadata must be JSON serializable'
      )
    }

    if (
      !serialized ||
      new TextEncoder().encode(serialized).length > this.MAX_SIZE_BYTES
    ) {
      throw new NotificationValidationException(
        'Notification metadata exceeds 16 KB'
      )
    }

    const parsed: unknown = JSON.parse(serialized)

    if (!this.isRecord(parsed)) {
      throw new NotificationValidationException('Invalid notification metadata')
    }

    this.validate(parsed)

    return new NotificationMetadata(parsed)
  }

  /** Validates supported metadata properties and navigation actions. */
  private static validate(value: Record<string, unknown>): void {
    for (const key of Object.keys(value)) {
      if (key !== 'version' && key !== 'actions' && key !== 'data') {
        throw new NotificationValidationException(
          `Unsupported notification metadata field: ${key}`
        )
      }
    }

    if (value.version !== undefined && value.version !== 1) {
      throw new NotificationValidationException('Unsupported metadata version')
    }

    if (value.actions !== undefined) {
      if (
        !this.isUnknownArray(value.actions) ||
        value.actions.length > this.MAX_ACTIONS
      ) {
        throw new NotificationValidationException(
          'Invalid notification actions'
        )
      }

      for (const item of value.actions) {
        if (
          !this.isRecord(item) ||
          typeof item.label !== 'string' ||
          !item.label.trim() ||
          item.label.length > 80
        ) {
          throw new NotificationValidationException('Invalid action label')
        }

        if ((item.href === undefined) === (item.resource === undefined)) {
          throw new NotificationValidationException(
            'Actions require exactly one destination'
          )
        }

        if (item.resource !== undefined) {
          if (
            !this.isRecord(item.resource) ||
            !this.isResourceType(item.resource.type) ||
            typeof item.resource.id !== 'string' ||
            (item.resource.label !== undefined &&
              typeof item.resource.label !== 'string')
          ) {
            throw new NotificationValidationException('Invalid action resource')
          }

          NotificationResource.create({
            type: item.resource.type,
            id: item.resource.id,
            ...(item.resource.label !== undefined
              ? { label: item.resource.label }
              : {}),
          })
        }

        if (item.href !== undefined) {
          if (typeof item.href !== 'string') {
            throw new NotificationValidationException(
              'Invalid action destination'
            )
          }

          if (this.isSafeInternalHref(item.href)) {
            continue
          }

          this.assertHttpsUrl(item.href)
        }
      }
    }

    if (value.data !== undefined && !this.isRecord(value.data)) {
      throw new NotificationValidationException(
        'Custom metadata must be an object'
      )
    }
  }

  /** Checks whether a value is a JSON object. */
  private static isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
  }

  /** Narrows an array to unknown elements without unsafe any access. */
  private static isUnknownArray(value: unknown): value is readonly unknown[] {
    return Array.isArray(value)
  }

  /** Checks whether a resource type is supported. */
  private static isResourceType(
    value: unknown
  ): value is NotificationResourceType {
    return (
      typeof value === 'string' &&
      Object.values<string>(NotificationResourceType).includes(value)
    )
  }

  /** Validates internal navigation paths without allowing control characters. */
  private static isSafeInternalHref(value: string): boolean {
    if (!value.startsWith('/') || value.startsWith('//')) {
      return false
    }

    for (const character of value) {
      const code = character.charCodeAt(0)

      if (character === '\\' || code < 32 || code === 127) {
        return false
      }
    }

    return true
  }

  /** Allows only HTTPS URLs for external navigation actions. */
  private static assertHttpsUrl(value: string): void {
    try {
      if (new URL(value).protocol === 'https:') {
        return
      }
    } catch {
      // Invalid URLs fall through to the domain exception.
    }

    throw new NotificationValidationException('External URLs must use HTTPS')
  }

  get value(): NotificationMetadataProps {
    return structuredClone(this.props)
  }

  get version(): 1 | undefined {
    return this.props.version
  }

  get actions(): readonly NotificationAction[] | undefined {
    return this.value.actions
  }

  get data(): Readonly<Record<string, NotificationMetadataValue>> | undefined {
    return this.value.data
  }
}
