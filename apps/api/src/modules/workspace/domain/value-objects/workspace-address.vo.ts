import { ValueObject } from '@/shared/domain'

export interface WorkspaceAddressProps {
  country?: string
  state?: string
  city?: string
  addressLine1?: string
  addressLine2?: string
  postalCode?: string
}

/**
 * Workspace Address VO
 */
export class WorkspaceAddress extends ValueObject<WorkspaceAddressProps> {
  override toString(): string {
    return [this.props.addressLine1, this.props.city, this.props.country]
      .filter(Boolean)
      .join(', ')
  }

  static empty(): WorkspaceAddress {
    return new WorkspaceAddress({})
  }

  static create(props: Partial<WorkspaceAddressProps> = {}): WorkspaceAddress {
    return new WorkspaceAddress({
      country: props.country,
      state: props.state,
      city: props.city,
      addressLine1: props.addressLine1,
      addressLine2: props.addressLine2,
      postalCode: props.postalCode,
    })
  }

  static fromPersistence(
    raw?: Partial<WorkspaceAddressProps> | null
  ): WorkspaceAddress {
    if (!raw) {
      return WorkspaceAddress.empty()
    }

    return WorkspaceAddress.create(raw)
  }

  toPersistence(): WorkspaceAddressProps | undefined {
    if (this.isEmpty()) {
      return undefined
    }

    return {
      country: this.props.country,
      state: this.props.state,
      city: this.props.city,
      addressLine1: this.props.addressLine1,
      addressLine2: this.props.addressLine2,
      postalCode: this.props.postalCode,
    }
  }

  toPrimitives() {
    return {
      country: this.props?.country,
      state: this.props?.state,
      city: this.props?.city,
      addressLine1: this.props?.addressLine1,
      addressLine2: this.props?.addressLine2,
      postalCode: this.props?.postalCode,
    }
  }

  private isEmpty() {
    return Object.values(this.props).every((value) => value == null)
  }
}
