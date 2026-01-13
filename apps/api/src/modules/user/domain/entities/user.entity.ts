import { CreateUserProps, UserProps } from '@/modules/user/domain'
import { Email, Password, UserPreferences } from '@/modules/user/domain'
import { UserId } from '@/modules/user/domain'
import { AuthProvider, UserStatus } from '@/modules/user/domain'
import { AggregateRoot } from '@/shared/domain'
import { UserCreatedEvent } from '@/modules/user/domain'

export class User extends AggregateRoot<UserId> {
  private _firstName: string
  private _lastName: string
  private _displayName: string
  private _email: Email
  private _passwordHash?: Password
  private _roleId?: string
  private _avatarUrl?: string
  private _emailVerified: boolean
  private _mfaEnabled: boolean
  private _mfaBackupCodes: string[]
  private _loginAttempts?: number
  private _lockedUntil?: Date | undefined
  private _authProvider: AuthProvider
  private _googleId?: string
  private _githubId?: string
  private _status: UserStatus
  private _lastLoginAt?: Date
  private _lastActiveAt?: Date
  private _preferences: UserPreferences
  private _timezone: string
  private _locale: string
  private readonly _createdAt: Date
  private _updatedAt: Date
  private _deletedAt?: Date
  private constructor(props: UserProps) {
    super(props.id)
    this._firstName = props.firstName
    this._lastName = props.lastName
    this._displayName = `${props.firstName} ${props.lastName}`
    this._email = props.email
    this._passwordHash = props.passwordHash
    this._roleId = props.roleId
    this._avatarUrl = props.avatarUrl
    this._emailVerified = props.emailVerified
    this._mfaEnabled = props.mfaEnabled
    this._mfaBackupCodes = props.mfaBackupCodes
    this._loginAttempts = props.loginAttempts
    this._lockedUntil = props.lockedUntil
    this._authProvider = props.authProvider
    this._googleId = props.googleId
    this._githubId = props.githubId
    this._status = props.status
    this._lastLoginAt = props.lastLoginAt
    this._lastActiveAt = props.lastActiveAt
    this._preferences = props.preferences
    this._createdAt = props.createdAt || new Date()
    this._updatedAt = props.updatedAt || new Date()
    this._deletedAt = props.deletedAt
  }

  // Getters
  get userId(): UserId {
    return this._id
  }

  get firstName(): string {
    return this._firstName
  }

  get lastName(): string {
    return this._lastName
  }

  get displayName(): string {
    return this._displayName
  }

  get email(): Email {
    return this._email
  }

  get passwordHash(): Password | undefined {
    return this._passwordHash
  }

  get avatarUrl(): string | undefined {
    return this._avatarUrl
  }

  get emailVerified(): boolean {
    return this._emailVerified
  }

  get mfaEnabled() {
    return this._mfaEnabled
  }

  get mfaBackupCodes(): string[] {
    return this._mfaBackupCodes
  }

  get loginAttempts(): number | undefined {
    return this._loginAttempts
  }

  get lockedUntil(): Date | undefined {
    return this._lockedUntil
  }

  get authProvider(): AuthProvider {
    return this._authProvider
  }

  get googleId(): string | undefined {
    return this._googleId
  }

  get githubId(): string | undefined {
    return this._githubId
  }

  get status(): UserStatus {
    return this._status
  }

  get lastLoginAt() {
    return this._lastLoginAt
  }

  get lastActiveAt() {
    return this._lastActiveAt
  }

  get preferences() {
    return this._preferences
  }

  get timezone(): string {
    return this._timezone
  }

  get locale(): string {
    return this._locale
  }

  get roleId() {
    return this._roleId
  }

  get createdAt() {
    return this._createdAt
  }

  get updatedAt() {
    return this._updatedAt
  }

  get deletedAt() {
    return this._deletedAt
  }

  static create(props: CreateUserProps): User {
    const userId = UserId.create()
    const now = new Date()

    const user = new User({
      id: userId,
      firstName: props.firstName,
      lastName: props.lastName,
      displayName: `${props.firstName} ${props.lastName}`,
      email: props.email,
      passwordHash: props.passwordHash,
      emailVerified: false,
      mfaEnabled: false,
      mfaBackupCodes: [],
      authProvider: props.authProvider || AuthProvider.EMAIL,
      status: UserStatus.ACTIVE,
      preferences: UserPreferences.createDefault(),
      createdAt: now,
      updatedAt: now,
    })

    user.addDomainEvent(
      new UserCreatedEvent({
        userId: userId.value,
        email: props.email.value,
        firstName: user.firstName,
        lastName: user.lastName,
      })
    )

    return user
  }

  /** Reconstitute user from persistence
   */
  static reconstitute(props: UserProps): User {
    return new User(props)
  }

  private touch(): void {
    this._updatedAt = new Date()
  }

  // Mark email as verified
  verifyEmail(): void {
    this._emailVerified = true
    this.touch()
  }

  // Record a successful login
  recordLogin(): void {
    this._lastLoginAt = new Date()
    this._lastActiveAt = new Date()
    this._loginAttempts = 0
    this._lockedUntil = undefined
    this.touch()
  }

  // Record a failed login attempt
  recordFailedLogin(): void {
    this._loginAttempts = (this._loginAttempts || 0) + 1
    this.touch()

    if (this._loginAttempts >= 5)
      this._lockedUntil = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes UPDATE WITH ENV
  }

  isLocked() {
    if (!this._lockedUntil) return false
    return new Date() < this._lockedUntil
  }

  canLogin() {
    return this._status === 'active' && !this.isLocked()
  }

  resetLoginAttempts() {
    this._loginAttempts = 0
    this._lockedUntil = undefined
    this._lastLoginAt = new Date()
    this._lastActiveAt = new Date()
    this.touch()
  }

  enableMfa(backupCodes: string[]): void {
    this._mfaEnabled = true
    this._mfaBackupCodes = backupCodes
    this.touch()
  }

  updateLastActive(): void {
    this._lastActiveAt = new Date()
    this.touch()
  }

  softDelete(): void {
    this._status = UserStatus.DELETED
    this._deletedAt = new Date()
    this.touch()
  }

  suspend(): void {
    this._status = UserStatus.SUSPENDED
    this.touch()
  }

  isDeleted(): boolean {
    return this._status === UserStatus.DELETED
  }

  isSuspended(): boolean {
    return this._status === UserStatus.SUSPENDED
  }
}
