import { ValueObject } from '@/shared/domain'

export interface OrganizationAddressProps {
  country?: string
  state?: string
  city?: string
  addressLine1?: string
  addressLine2?: string
  postalCode?: string
}

/**
 * Organization Address VO
 */
export class OrganizationAddress extends ValueObject<OrganizationAddressProps> {
  toString(): string {
    return [this.props.addressLine1, this.props.city, this.props.country]
      .filter(Boolean)
      .join(', ')
  }

  static empty(): OrganizationAddress {
    return new OrganizationAddress({})
  }

  static create(props: OrganizationAddressProps): OrganizationAddress {
    return new OrganizationAddress(props)
  }
}
