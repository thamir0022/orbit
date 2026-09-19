import { ActiveSession, SessionDeviceType } from '../contracts'
import { SessionData } from '../ports/session-manager.interface'

export class SessionMapper {
  static toActiveSession(
    session: SessionData,
    currentSessionId: string
  ): ActiveSession {
    return {
      id: session.id,

      isCurrent: session.sid === currentSessionId,

      device: {
        type: this.normalizeDeviceType(session.userAgent.device.type),

        browser: session.userAgent.browser.name,

        browserVersion: session.userAgent.browser.version,

        operatingSystem: this.buildOperatingSystem(
          session.userAgent.os.name,
          session.userAgent.os.version
        ),
      },

      ipAddress: session.ipAddress,

      lastActiveAt: session.lastActiveAt,

      createdAt: session.createdAt,
    }
  }

  private static normalizeDeviceType(
    type: string | undefined
  ): SessionDeviceType {
    switch (type) {
      case 'mobile':
      case 'tablet':
      case 'smart-tv':
      case 'console':
      case 'wearable':
      case 'embedded':
        return type

      case 'desktop':
        return 'desktop'

      default:
        return 'desktop'
    }
  }

  private static buildOperatingSystem(
    name: string | undefined,
    version: string | undefined
  ): string | undefined {
    if (!name) return undefined

    return version ? `${name} ${version}` : name
  }
}
