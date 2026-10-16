'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'

import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group'

type Theme = 'light' | 'dark' | 'system'

const subscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  if (!mounted) {
    return null
  }

  return (
    <ToggleGroup
      type="single"
      value={theme as Theme}
      onValueChange={(value) => {
        if (value) {
          setTheme(value)
        }
      }}
      variant="outline"
      size="sm"
      className="w-fit"
      aria-label="Select theme"
    >
      <ToggleGroupItem value="light" aria-label="Light theme" title="Light">
        <Sun className="size-4" />
      </ToggleGroupItem>

      <ToggleGroupItem value="dark" aria-label="Dark theme" title="Dark">
        <Moon className="size-4" />
      </ToggleGroupItem>

      <ToggleGroupItem value="system" aria-label="System theme" title="System">
        <Monitor className="size-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
