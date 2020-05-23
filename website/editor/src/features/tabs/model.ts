import {createApi} from 'effector'
import {createMediaMatcher} from '~/lib/media-query'
import {createLocalStore} from '~/lib/local-store'

export type Tab =
  | 'graphite'
  | 'dom'
  | 'share'
  | 'editor'
  | 'outline'
  | 'settings'
  | 'errors'

export const $isDesktopChanges = createMediaMatcher('(min-width: 700px)')

export const $tab = createLocalStore<Tab>(
  'current-tab',
  $isDesktopChanges.getState() ? 'dom' : 'editor',
)

export const tabApi = createApi($tab, {
  showDOM: () => 'dom',
  showEditor: () => 'editor',
  showErrors: () => 'errors',
  showGraphite: () => 'graphite',
  showOutline: () => 'outline',
  showSettings: () => 'settings',
  showShare: () => 'share',
})

$tab.on($isDesktopChanges, (tab, isDesktop) => {
  if (tab === 'editor' && isDesktop) return 'dom'
  if (tab === 'outline' && isDesktop) return 'dom'
  return tab
})
