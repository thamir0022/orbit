import { routes } from '../model/routes'
import type { SettingsRouteKey } from '../model/settings-sidebar.config'

export const getSettingsRoute = (key: SettingsRouteKey, slug: string) => {
  return routes.settings[key](slug)
}
