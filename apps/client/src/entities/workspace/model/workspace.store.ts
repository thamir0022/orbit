import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Workspace } from './workspace.types'
import { useShallow } from 'zustand/react/shallow'

interface WorkspaceState {
  workspace: Workspace | null
  setWorkspace: (workspace: Workspace) => void
  clearWorkspace: () => void
}

export const useWorkspaceStore = create<WorkspaceState>()(
  devtools(
    (set) => ({
      workspace: null,

      setWorkspace: (workspace) =>
        set({ workspace: workspace }, false, 'workspace/active'),

      clearWorkspace: () => set({ workspace: null }, false, 'workspace/clear'),
    }),
    { name: 'WorkspaceStore' }
  )
)

// Export individual selectors for better performance in UI components
export const useWorkspace = () => useWorkspaceStore((state) => state.workspace)

export const useWorkspaceActions = () => {
  return useWorkspaceStore(
    useShallow((state) => ({
      workspace: state.workspace,
      setWorkspace: state.setWorkspace,
      clearWorkspace: state.clearWorkspace,
    }))
  )
}
