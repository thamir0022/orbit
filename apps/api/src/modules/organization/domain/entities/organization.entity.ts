import { AggregateRoot } from '@/shared/domain'
import { UserId } from '@/modules/user/domain'
import { OrganizationId } from '../value-objects/organization-id.vo'
import {
  OrganizationSettings,
  OrganizationAddress,
  OrganizationContact,
  OrganizationVerification,
  OrganizationSettingsProps,
} from '../value-objects'
import { OrganizationCreatedEvent } from '../events'
import { CompanyType, CompanySize, OrganizationStatus } from '../enums'

// Props interface for Reconstitution (from DB)
export interface OrganizationProps {
  id: OrganizationId
  name: string
  subdomain: string
  ownerId: UserId
  companySize?: CompanySize
  companyType?: CompanyType

  // Plan ID string for now
  planId: string
  subscriptionId?: string
  trialEndsAt?: Date

  // Value Objects
  settings: OrganizationSettings
  location: OrganizationAddress
  contactInfo: OrganizationContact
  verification: OrganizationVerification

  status: OrganizationStatus

  createdAt: Date
  updatedAt?: Date
  deletedAt?: Date
}

// Props for Creation (User Input)
export interface CreateOrganizationProps {
  name: string
  subdomain: string
  ownerId: UserId
  defaultPlanId: string // Passed from a service that knows the default plan
  companySize?: CompanySize
  companyType?: CompanyType
}

export class Organization extends AggregateRoot<OrganizationId> {
  private _name: string
  private _subdomain: string
  private _ownerId: UserId

  private _companySize?: CompanySize
  private _companyType?: CompanyType

  private _planId: string
  private _subscriptionId?: string
  private _trialEndsAt?: Date

  private _settings: OrganizationSettings
  private _location: OrganizationAddress
  private _contactInfo: OrganizationContact
  private _verification: OrganizationVerification

  private _status: OrganizationStatus

  private readonly _createdAt: Date
  private _updatedAt: Date
  private _deletedAt?: Date

  private constructor(props: OrganizationProps) {
    super(props.id)
    this._name = props.name
    this._subdomain = props.subdomain
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
    this._createdAt = props.createdAt || new Date()
    this._updatedAt = props.updatedAt || new Date()
    this._deletedAt = props.deletedAt
  }

  // --- Factory Method ---

  static create(props: CreateOrganizationProps): Organization {
    const organizationId = OrganizationId.create()

    const org = new Organization({
      id: organizationId,
      name: props.name,
      subdomain: props.subdomain,
      ownerId: props.ownerId,
      companySize: props.companySize,
      companyType: props.companyType,

      planId: props.defaultPlanId, // Injected, not hardcoded

      // Initialize Value Objects with Defaults
      settings: OrganizationSettings.createDefault(),
      location: OrganizationAddress.empty(),
      contactInfo: OrganizationContact.empty(),
      verification: OrganizationVerification.createDefault(),

      status: OrganizationStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    org.addDomainEvent(
      new OrganizationCreatedEvent({
        organizationId: organizationId.value,
        name: props.name,
        ownerId: props.ownerId.value,
      })
    )

    return org
  }

  // --- Getters ---

  get name(): string {
    return this._name
  }

  get subdomain(): string {
    return this._subdomain
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

  get companyType(): string | undefined {
    return this._companyType
  }

  get companySize(): string | undefined {
    return this._companySize
  }

  // Expose Value Objects (Immutable by default)
  get settings(): OrganizationSettings {
    return this._settings
  }

  get location(): OrganizationAddress {
    return this._location
  }

  get contactInfo(): OrganizationContact {
    return this._contactInfo
  }

  get verification(): OrganizationVerification {
    return this._verification
  }

  get status() {
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

  /** Reconstitute organization from persistence
   */
  static reconstitute(props: OrganizationProps): Organization {
    return new Organization(props)
  }

  updateSettings(props: Partial<OrganizationSettingsProps>): void {
    this._settings = this._settings.update(props)
    this.touch()
  }

  updateAddress(address: OrganizationAddress): void {
    this._location = address
    this.touch()
  }

  updateContactInfo(contact: OrganizationContact): void {
    this._contactInfo = contact
    this.touch()
  }

  verifyOrganization(): void {
    this._verification = OrganizationVerification.verify()
    this.touch()
  }

  changePlan(newPlanId: string, subscriptionId?: string): void {
    // Domain logic: Maybe check if the transition is allowed?
    this._planId = newPlanId
    if (subscriptionId) this._subscriptionId = subscriptionId
    this.touch()
  }

  delete(): void {
    if (this._status === OrganizationStatus.DELETED) return
    this._status = OrganizationStatus.DELETED
    this._deletedAt = new Date()
    this.touch()
    // TO DO: Add Event: OrganizationDeletedEvent
  }
}
