import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import type { User } from './user.types'

// 1. Separate State and Actions for cleaner typing
interface UserState {
  user: User | null
}

interface UserActions {
  setUser: (user: User | null) => void
  clearUser: () => void
}

type UserStore = UserState & UserActions

// 2. Wrap with devtools and explicitly type the create function
export const useUserStore = create<UserStore>()(
  devtools(
    (set) => ({
      user: null,
      // --- Actions ---
      // The third argument in set() is the action name for Redux DevTools
      setUser: (user) => set({ user }, false, 'user/setUser'),

      clearUser: () => set({ user: null }, false, 'user/clearUser'),
    }),
    { name: 'UserStore' } // Names the store in the DevTools window
  )
)

// ----------------------------------------------------------------------
// 3. Export Custom Selectors (The Rendering Optimization)
// ----------------------------------------------------------------------

/**
 * Hook to strictly access the user object.
 * Components using this will ONLY re-render when the user object changes.
 */
export const useUser = () => useUserStore((state) => state.user)

/**
 * Hook to strictly access actions.
 * Components using this will NEVER re-render when the user state changes.
 */
export const useUserActions = () => {
  return useUserStore(
    useShallow((state) => ({
      setUser: state.setUser,
      clearUser: state.clearUser,
    }))
  )
}
