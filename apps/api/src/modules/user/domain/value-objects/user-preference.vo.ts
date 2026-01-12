import { ValueObject } from "@/shared/domain"

export interface UserPreferencesData {
  theme: "light" | "dark" | "system"
  notifications: {
    email: boolean
    push: boolean
    inApp: boolean
  }
}

interface UserPreferencesProps {
  preferences: UserPreferencesData
  timezone: string
  locale: string
}

/**
 * UserPreferences Value Object
 * Encapsulates user preference settings
 */
export class UserPreferences extends ValueObject<UserPreferencesProps> {
  private constructor(props: UserPreferencesProps) {
    super(props)
  }

  get preferences(): UserPreferencesData {
    return this.props.preferences
  }

  get timezone(): string {
    return this.props.timezone
  }

  get locale(): string {
    return this.props.locale
  }

  static createDefault(): UserPreferences {
    return new UserPreferences({
      preferences: {
        theme: "system",
        notifications: {
          email: true,
          push: true,
          inApp: true,
        },
      },
      timezone: "UTC",
      locale: "en-IN",
    })
  }

  static create(preferences: Partial<UserPreferencesData>, timezone?: string, locale?: string): UserPreferences {
    const defaultPrefs = this.createDefault()

    return new UserPreferences({
      preferences: {
        ...defaultPrefs.preferences,
        ...preferences,
      },
      timezone: timezone || defaultPrefs.timezone,
      locale: locale || defaultPrefs.locale,
    })
  }
}
