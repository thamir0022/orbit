import { CreateUserProps, UserProps } from '@/modules/user/domain'
import { Email, Password, UserPreferences } from '@/modules/user/domain'
import { UserId } from '@/modules/user/domain'
import { AuthProvider, UserStatus } from '@/modules/user/domain'
import { AggregateRoot } from '@/shared/domain'
import { UserCreatedEvent } from '@/modules/user/domain'
import { UpdateProfileProps } from '../interfaces/update-profile.interface'

export class User extends AggregateRoot<UserId> {
  private _firstName: string
  private _lastName: string
  private _displayName: string
  private _email: Email
  private _passwordHash: Password | undefined
  private _hasPassword: boolean
  private _passwordUpdatedAt?: Date
  private _avatarUrl: string | undefined
  private _emailVerified: boolean
  private _mfaEnabled: boolean
  private _mfaBackupCodes: string[]
  private _loginAttempts: number | undefined
  private _lockedUntil: Date | undefined
  private _authProvider: AuthProvider
  private _oauthProviderId: string | undefined
  private _status: UserStatus
  private _lastLoginAt: Date | undefined
  private _lastActiveAt: Date | undefined
  private _preferences: UserPreferences
  private _timezone: string | undefined
  private _locale: string | undefined
  private readonly _createdAt: Date
  private _updatedAt: Date
  private _deletedAt: Date | undefined
  private constructor(props: UserProps) {
    super(props.id)
    this._firstName = props.firstName
    this._lastName = props.lastName
    this._displayName = `${props.firstName} ${props.lastName}`
    this._email = props.email
    this._passwordHash = props.passwordHash
    this._hasPassword = props.hasPassword
    this._passwordUpdatedAt = props.passwordUpdatedAt
    this._avatarUrl = props.avatarUrl
    this._emailVerified = props.emailVerified
    this._mfaEnabled = props.mfaEnabled
    this._mfaBackupCodes = props.mfaBackupCodes
    this._loginAttempts = props.loginAttempts
    this._lockedUntil = props.lockedUntil
    this._authProvider = props.authProvider
    this._oauthProviderId = props.oauthProviderId
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

  get hasPassword(): boolean {
    return this._hasPassword
  }

  get passwordUpdatedAt(): Date | undefined {
    return this._passwordUpdatedAt
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

  get oauthProviderId(): string | undefined {
    return this._oauthProviderId
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

  get timezone(): string | undefined {
    return this._timezone
  }

  get locale(): string | undefined {
    return this._locale
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

  updateProfile(updates: UpdateProfileProps) {
    this._firstName = updates.firstName ?? this._firstName
    this._lastName = updates.lastName ?? this._lastName
    this._displayName = updates.displayName ?? this._displayName
  }

  // Setters
  set email(email: Email) {
    this._email = email
  }

  set passwordHash(passwordHash: Password) {
    this._passwordHash = passwordHash
  }

  set hasPassword(hasPassword: boolean) {
    this._hasPassword = hasPassword
  }

  set passwordUpdatedAt(passwordUpdatedAt: Date) {
    this._passwordUpdatedAt = passwordUpdatedAt
  }

  set avatarUrl(avartarUrl: string) {
    this._avatarUrl = avartarUrl
  }

  set status(status: UserStatus) {
    this._status = status
  }

  set preferences(preferences: UserPreferences) {
    this._preferences = preferences
  }

  set timezone(timeZone: string) {
    this._timezone = timeZone
  }

  set locale(locale: string) {
    this._locale = locale
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
      avatarUrl: props.avatarUrl,
      passwordHash: props.passwordHash,
      hasPassword: !!props.passwordHash,
      emailVerified: props.emailVerified ?? false,
      mfaEnabled: false,
      mfaBackupCodes: [],
      authProvider: props.authProvider,
      oauthProviderId: props.oauthProviderId,
      status: UserStatus.ACTIVE,
      preferences: UserPreferences.createDefault(),
      loginAttempts: undefined,
      lockedUntil: undefined,
      lastLoginAt: undefined,
      lastActiveAt: undefined,
      deletedAt: undefined,
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
    return this._status === UserStatus.ACTIVE && !this.isLocked()
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
