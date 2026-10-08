import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  MessageSquare,
  Settings,
  Folder,
} from 'lucide-react'

export const sidebarConfig = {
  workspace: [
    {
      title: 'Overview',
      path: 'overview',
      icon: LayoutDashboard,
    },
    {
      title: 'Projects',
      path: 'projects',
      icon: FolderKanban,
    },
    {
      title: 'Docs',
      path: 'docs',
      icon: Folder,
    },
  ],

  system: [
    {
      title: 'Settings',
      path: 'settings',
      icon: Settings,
    },
  ],
}
