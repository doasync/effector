import React from 'react'
import {Event} from 'effector'
import {useStore, useStoreMap} from 'effector-react'

import {GraphitePanel} from '~/features/graphite'
import {SettingsPanel, PrettifyButton, $flowToggle} from '~/features/settings'
import {TypeErrorsView} from '~/features/flow'
import {SharePanel} from '~/features/share'
import {createMediaQuery} from '~/lib/media-query'

import {tabApi, $tab, Tab} from '../model'
import {TabHeader, TabHeaderList} from './tab'

export const SmallScreens = createMediaQuery('(max-width: 699px)')
export const DesktopScreens = createMediaQuery('(max-width: 700px)')

const tabs: Record<Tab, {select: Event<void>; title: string}> = {
  editor: {
    select: tabApi.showEditor,
    title: 'Editor',
  },
  outline: {
    select: tabApi.showOutline,
    title: 'Outline',
  },
  errors: {
    select: tabApi.showErrors,
    title: 'Errors',
  },
  dom: {
    select: tabApi.showDOM,
    title: 'DOM',
  },
  graphite: {
    select: tabApi.showGraphite,
    title: 'Graphite',
  },
  share: {
    select: tabApi.showShare,
    title: 'Share',
  },
  settings: {
    select: tabApi.showSettings,
    title: 'Settings',
  },
}

export const TabsPanel = () => {
  const tab = useStore($tab)
  const flowToggle = useStore($flowToggle)
  return (
    <>
      <TabHeaderList
        className="header-tabs"
        style={{
          borderLeft: '1px solid #ddd',
          display: 'flex',
          justifyContent: 'space-between',
        }}>
        <PrettifyButton />
        <SmallScreens>
          <TabHeaderTemplate name="editor" />
        </SmallScreens>
        {flowToggle && <TabHeaderTemplate name="errors" />}
        <TabHeaderTemplate name="dom" />
        <TabHeaderTemplate name="share" />
        <TabHeaderTemplate name="settings" />
      </TabHeaderList>
      {tab === 'graphite' && <GraphitePanel />}
      <div style={{display: tab === 'dom' ? 'block' : 'none'}} className="dom">
        <iframe id="dom" />
      </div>
      {tab === 'share' && <SharePanel />}
      {tab === 'settings' && <SettingsPanel />}
      {tab === 'errors' && <TypeErrorsView />}
    </>
  )
}

const TabHeaderTemplate: React.FC<{name: Tab}> = ({name}) => {
  const isActive = useStoreMap({
    store: $tab,
    keys: [name],
    fn: (activeTab, [tab]) => activeTab === tab,
  })
  const {select, title} = tabs[name]
  return (
    <TabHeader onClick={select} isActive={isActive}>
      {title}
    </TabHeader>
  )
}
