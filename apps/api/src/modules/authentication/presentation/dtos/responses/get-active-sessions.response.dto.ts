export class GetActiveSessionsResponseDto {
  sessions!: ActiveSessionResponseDto[] | null
  total!: number
}

export class ActiveSessionResponseDto {
  id!: string
  isCurrent!: boolean
  device!: {
    type: string
    browser: string | undefined
    browserVersion: string | undefined
    operatingSystem: string | undefined
  }

  ipAddress!: string | undefined
  lastActiveAt!: Date
  createdAt!: Date
}
