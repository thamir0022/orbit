import { create } from 'zustand'
import { User } from './user.types'

interface UserState {
  user: User | null
  accessToken: string | null
  setUser: (user: User | null) => void
  setAccessToken: (token: string | null) => void
  signOut: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  accessToken: null,
  setAccessToken: (accessToken) => set({ accessToken }),
  signOut: () => set({ user: null, accessToken: null }),
}))
