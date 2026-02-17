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

  toPersistence() {
    return {
      country: this.props.country,
      state: this.props.state,
      city: this.props.city,
      addressLine1: this.props.addressLine1,
      addressLine2: this.props.addressLine2,
      postalCode: this.props.postalCode,
    }
  }
}
