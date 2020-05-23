import React from 'react'
import {combine} from 'effector'
import {useStore} from 'effector-react'
import debounce from 'lodash.debounce'

import 'codemirror/lib/codemirror.css'
import './globals.css'

import {CodeMirror} from '~/features/graphite'
import {
  $sourceCode,
  changeSources,
  codeCursorActivity,
  codeMarkLine,
  codeSetCursor,
  ErrorsPanel,
  performLint,
} from '~/features/editor'
import {
  $isDesktopChanges,
  $tab,
  DesktopScreens,
  OutlineView,
  SecondaryPanel,
  SmallScreens,
  TabsPanel,
} from '~/features/tabs'
import {TypeErrorsView} from '~/features/flow'
import {$typeChecker} from '~/features/settings'
import {$stats} from '~/features/realm'
import {GithubHeaderButton} from '~/features/github'

import {Sizer} from '~/lib/sizer'

const $mode = $typeChecker.map(typeChecker => {
  if (typeChecker === 'typescript') return 'text/typescript-jsx'
  return 'text/flow-jsx'
})

const changeSourcesDebounced = debounce(changeSources, 500)

const $displayEditor = combine($tab, $isDesktopChanges, (tab, isDesktop) =>
  isDesktop ? true : tab === 'editor',
)

const $displayOutline = combine(
  $tab,
  $isDesktopChanges,
  (tab, isDesktop) => isDesktop || tab === 'editor',
)

export const Application: React.FC = () => {
  const displayOutline = useStore($displayOutline)
  const tab = useStore($tab)

  return (
    <>
      {displayOutline && <OutlineView />}
      <CodePanel />
      <TabsPanel />
      <SmallScreens>
        {tab !== 'share' && tab !== 'settings' && (
          <>
            <SecondaryPanel />
            <ErrorsPanel />
          </>
        )}
      </SmallScreens>
      <DesktopScreens>
        <SecondaryPanel />
        <ErrorsPanel />
      </DesktopScreens>
      <GithubHeaderButton />
    </>
  )
}

type OptElement = HTMLElement | null

const CodePanel: React.FC = () => {
  const displayEditor = useStore($displayEditor)
  const mode = useStore($mode)
  const sourceCode = useStore($sourceCode)

  const [outlineSidebar, setOutlineSidebar] = React.useState<OptElement>(null)
  const [consolePanel, setConsolePanel] = React.useState<OptElement>(null)

  React.useEffect(() => {
    setOutlineSidebar(document.getElementById('outline-sidebar'))
    setConsolePanel(document.getElementById('console-panel'))
  }, [])

  return (
    <div
      className="sources"
      style={{
        visibility: displayEditor ? 'visible' : 'hidden',
        display: 'flex',
      }}>
      <DesktopScreens>
        <Sizer
          direction="vertical"
          container={outlineSidebar}
          cssVar="--outline-width"
          sign={1}
        />
      </DesktopScreens>

      <div className="sources" style={{flex: '1 0 auto'}}>
        <CodeMirror
          markLine={codeMarkLine}
          setCursor={codeSetCursor}
          performLint={performLint}
          onCursorActivity={codeCursorActivity}
          value={sourceCode ?? ''}
          mode={mode}
          onChange={changeSourcesDebounced}
          lineWrapping
          passive
        />
        <TypeErrorsView />
      </div>

      <DesktopScreens>
        <Sizer
          direction="vertical"
          container={consolePanel}
          cssVar="--right-panel-width"
          sign={-1}
        />
      </DesktopScreens>
    </div>
  )
}
