import React from 'react'
import {styled} from 'linaria/react'
import {createApi, createStore} from 'effector'
import {useStore} from 'effector-react'

import {Sizer} from '~/lib/sizer'
import {LogsPanel} from '~/features/logs'
import {TabHeaderList, $tab, Tab} from '~/features/tabs'
import {theme, clearConsole} from '~/features/logs'
import {$logs} from '~/features/logs'
import {$stats} from '~/features/realm'
import {codeSetCursor} from '~/features/editor'

import {IconButton, Outline} from '~/ui'

import {SmallScreens, DesktopScreens} from './tabs-panel'

export const OutlineView: React.FC = () => {
  const stats = useStore($stats)

  return <Outline {...stats} onItemClick={codeSetCursor} />
}

const $currentTab = createStore<'console' | 'editor' | 'outline'>('console')
const changeTab = createApi($currentTab, {
  console: () => 'console',
  outline: () => 'outline',
})

export const SecondaryPanel = () => {
  const [ref, setRef] = React.useState<HTMLDivElement | null>(null)
  const currentTab = useStore($currentTab)
  const mainTab = useStore($tab)

  return (
    <Container ref={setRef} id="console-panel">
      <Sizer
        direction="horizontal"
        cssVar="--console-height"
        container={ref}
        sign={-1}
        size="28"
        min={0}
        max="calc(100vh - 50px - 32px)"
        middle="calc((100vh - 50px - 32px) / 2)"
        hover=".8">
        <Toolbar />
      </Sizer>
      <SmallScreens>
        {currentTab === 'console' || mainTab !== 'editor' ? (
          <LogsPanel />
        ) : (
          <OutlineView />
        )}
      </SmallScreens>
      <DesktopScreens>
        <LogsPanel />
      </DesktopScreens>
    </Container>
  )
}

const Toolbar: React.FC = () => {
  const currentTab = useStore($currentTab)
  const logs = useStore($logs)
  const tab = useStore($tab)

  return (
    <TabHeaderList justify="space-between" style={{border: 'none'}}>
      <div style={{display: 'flex'}}>
        <TabComponent
          onMouseDown={() => changeTab.console()}
          active={currentTab === 'console' || tab !== 'editor'}>
          Console{' '}
          {logs.length > 0 && (
            <span style={{marginLeft: 10, color: '#999'}}>({logs.length})</span>
          )}
        </TabComponent>
        <SmallScreens>
          {tab === 'editor' && (
            <TabComponent
              onMouseDown={() => changeTab.outline()}
              active={currentTab === 'outline'}>
              Outline
            </TabComponent>
          )}
        </SmallScreens>
      </div>
      <div style={{margin: '5px 5px 0 0'}}>
        <IconButton
          title="Clear"
          icon={theme.styles.TRASH_ICON}
          onMouseDown={() => clearConsole()}
        />
      </div>
    </TabHeaderList>
  )
}

interface TabComponentProps {
  active?: boolean
  onMouseDown?: React.MouseEventHandler<HTMLLIElement>
}

const TabComponent = styled.li<TabComponentProps>`
  border-right: 1px solid #ddd;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  padding: 7px 15px;
  margin: 0;
  background-color: ${({active}) => (active ? 'white' : 'inherit')};
  border-bottom: ${({active}) =>
    active ? '3px solid #e95801' : '3px solid transparent'};
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: #fff;
  border-left: 1px solid #ddd;
  z-index: 1;

  @media (max-width: 699px) {
    grid-column: 1 / span 1;
    grid-row: 3 / span 1;
    grid-template-columns: repeat(2, minmax(100px, 1fr));
  }

  @media (min-width: 700px) {
    grid-column: 3 / span 1;
    grid-row: 3 / span 1;
    grid-template-columns: repeat(2, minmax(100px, 1fr));
  }
`
