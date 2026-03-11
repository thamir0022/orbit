import { create } from 'zustand'
import type { Organization } from './organization.types'

interface OrganizationState {
  organization: Organization | null
  setOrganization: (organization: Organization | null) => void
  clearOrganization: () => void
}

export const useOrganizationStore = create<OrganizationState>((set) => ({
  organization: null,
  setOrganization: (organization) => set({ organization }),
  clearOrganization: () => set({ organization: null }),
}))
