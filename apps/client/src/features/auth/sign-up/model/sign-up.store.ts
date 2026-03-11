import { create } from 'zustand'

interface SignUpState {
  currentStep: number
  email: string | null
  registrationToken: string
  // Actions
  nextStep: () => void
  prevStep: () => void
  setEmail: (email: string) => void
  setRegistrationToken: (token: string) => void
  reset: () => void
}

export const useSignUpStore = create<SignUpState>((set) => ({
  currentStep: 1,
  email: null,
  registrationToken: '',

  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () =>
    set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),
  setEmail: (email) => set({ email }),
  setRegistrationToken: (token) => set({ registrationToken: token }),

  reset: () => set({ currentStep: 1, email: null }),
}))
