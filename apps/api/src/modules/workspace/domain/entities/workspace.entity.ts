import { AggregateRoot } from '@/shared/domain'
import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '../value-objects/workspace-id.vo'
import {
  WorkspaceSettings,
  WorkspaceAddress,
  WorkspaceContact,
  WorkspaceVerification,
  WorkspaceSettingsProps,
} from '../value-objects'
import { WorkspaceCreatedEvent } from '../events'
import { CompanyType, CompanySize, WorkspaceStatus } from '../enums'
import { UpdateBasicWorkspaceInfoProps } from '../interfaces'

// Props interface for Reconstitution (from DB)
export interface WorkspaceProps {
  id: WorkspaceId
  name: string
  slug: string
  ownerId: UserId
  companySize?: CompanySize
  companyType?: CompanyType

  // Plan ID string for now
  planId: string
  subscriptionId?: string
  trialEndsAt?: Date

  // Value Objects
  settings: WorkspaceSettings
  location: WorkspaceAddress
  contactInfo: WorkspaceContact
  verification: WorkspaceVerification

  status: WorkspaceStatus

  createdAt: Date
  updatedAt?: Date
  deletedAt?: Date
}

// Props for Creation (User Input)
export interface CreateWorkspaceProps {
  name: string
  slug: string
  ownerId: UserId
  defaultPlanId: string // Passed from a service that knows the default plan
  companySize?: CompanySize
  companyType?: CompanyType
}

export class Workspace extends AggregateRoot<WorkspaceId> {
  private _name: string
  private _slug: string
  private _ownerId: UserId

  private _companySize?: CompanySize
  private _companyType?: CompanyType

  private _planId: string
  private _subscriptionId?: string
  private _trialEndsAt?: Date

  private _settings: WorkspaceSettings
  private _location: WorkspaceAddress
  private _contactInfo: WorkspaceContact
  private _verification: WorkspaceVerification

  private _status: WorkspaceStatus

  private readonly _createdAt: Date
  private _updatedAt: Date
  private _deletedAt?: Date

  private constructor(props: WorkspaceProps) {
    super(props.id)
    this._name = props.name
    this._slug = props.slug
    this._ownerId = props.ownerId
    this._companySize = props.companySize
    this._companyType = props.companyType
    this._planId = props.planId
    this._subscriptionId = props.subscriptionId
    this._trialEndsAt = props.trialEndsAt

    // Assign Value Objects
    this._settings = props.settings
    this._location = props.location
    this._contactInfo = props.contactInfo
    this._verification = props.verification

    this._status = props.status
    this._createdAt = props.createdAt ?? new Date()
    this._updatedAt = props.updatedAt ?? new Date()
    this._deletedAt = props.deletedAt
  }

  // --- Factory Method ---

  static create(props: CreateWorkspaceProps): Workspace {
    const workspaceId = WorkspaceId.create()

    const org = new Workspace({
      id: workspaceId,
      name: props.name,
      slug: props.slug,
      ownerId: props.ownerId,
      companySize: props.companySize,
      companyType: props.companyType,

      planId: props.defaultPlanId, // Injected, not hardcoded

      // Initialize Value Objects with Defaults
      settings: WorkspaceSettings.createDefault(),
      location: WorkspaceAddress.empty(),
      contactInfo: WorkspaceContact.empty(),
      verification: WorkspaceVerification.createDefault(),

      status: WorkspaceStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    org.addDomainEvent(
      new WorkspaceCreatedEvent({
        workspaceId: workspaceId.value,
        name: props.name,
        ownerId: props.ownerId.value,
      })
    )

    return org
  }

  // --- Getters ---

  get id(): WorkspaceId {
    return this._id
  }

  get name(): string {
    return this._name
  }

  get slug(): string {
    return this._slug
  }

  get ownerId(): UserId {
    return this._ownerId
  }

  get planId(): string {
    return this._planId
  }

  get subscriptionId(): string | undefined {
    return this._subscriptionId
  }

  get trialEndsAt(): Date | undefined {
    return this._trialEndsAt
  }

  get companyType(): CompanyType | undefined {
    return this._companyType
  }

  get companySize(): CompanySize | undefined {
    return this._companySize
  }

  // Expose Value Objects (Immutable by default)
  get settings(): WorkspaceSettings {
    return this._settings
  }

  get location(): WorkspaceAddress {
    return this._location
  }

  get contactInfo(): WorkspaceContact {
    return this._contactInfo
  }

  get verification(): WorkspaceVerification {
    return this._verification
  }

  get status(): WorkspaceStatus {
    return this._status
  }

  get createdAt(): Date {
    return this._createdAt
  }

  get updatedAt(): Date {
    return this._updatedAt
  }

  get deletedAt(): Date | undefined {
    return this._deletedAt
  }

  // --- Domain Behaviors (Setters wrapped in Logic) ---

  private touch(): void {
    this._updatedAt = new Date()
  }

  /** Reconstitute workspace from persistence
   */
  static reconstitute(props: WorkspaceProps): Workspace {
    return new Workspace(props)
  }

  updateBasicInfo(props: Partial<UpdateBasicWorkspaceInfoProps>) {
    this._name = props.name ?? this._name
    this._slug = props.slug ?? this._slug
    this._companySize = props.companySize ?? this._companySize
    this._companyType = props.companyType ?? this.companyType
  }

  updateSettings(props: Partial<WorkspaceSettingsProps>): void {
    this._settings = this._settings.update(props)
    this.touch()
  }

  updateAddress(address: WorkspaceAddress): void {
    this._location = address
    this.touch()
  }

  updateContactInfo(contact: WorkspaceContact): void {
    this._contactInfo = contact
    this.touch()
  }

  verifyWorkspace(): void {
    this._verification = WorkspaceVerification.verify()
    this.touch()
  }

  changePlan(newPlanId: string, subscriptionId?: string): void {
    // Domain logic: Maybe check if the transition is allowed?
    this._planId = newPlanId
    if (subscriptionId) this._subscriptionId = subscriptionId
    this.touch()
  }

  delete(): void {
    this._status = WorkspaceStatus.DELETED
    this._deletedAt = new Date()
    this.touch()
    // TO DO: Add Event: WorkspaceDeletedEvent
  }
}
