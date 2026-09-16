'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from './button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { ToggleGroup, ToggleGroupItem } from './toggle-group'

type ThemeToggleType = 'dropdown' | 'toggle'

export function ThemeToggle({
  toggleType = 'dropdown',
}: {
  toggleType?: ThemeToggleType
}) {
  const { theme, setTheme } = useTheme()

  return toggleType === 'dropdown' ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <ToggleGroup
      variant="outline"
      type="single"
      size="lg"
      className="*:cursor-pointer"
      defaultValue={theme}
      onValueChange={(theme) => setTheme(theme)}
    >
      <ToggleGroupItem value="light">
        <Sun className="" />
      </ToggleGroupItem>
      <ToggleGroupItem value="dark">
        <Moon className="" />
      </ToggleGroupItem>
      <ToggleGroupItem value="system">
        <Monitor className="" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
