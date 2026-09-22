export type SessionDeviceType =
  | 'desktop'
  | 'mobile'
  | 'tablet'
  | 'smart-tv'
  | 'console'
  | 'wearable'
  | 'embedded'
  | 'unknown'

export interface SessionDevice {
  type: SessionDeviceType
  browser: string | undefined
  browserVersion: string | undefined
  operatingSystem: string | undefined
}

export interface Session {
  id: string
  isCurrent: boolean
  device: SessionDevice
  ipAddress: string | undefined
  lastActiveAt: Date
  createdAt: Date
}
