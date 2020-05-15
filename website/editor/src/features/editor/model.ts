import {combine, createEffect, createEvent, forward, sample} from 'effector'

import CM from 'codemirror'

import {resetGraphiteState} from '~/features/graphite'
import {evaluator, $versionLoader} from '~/features/evaluator'
import {$typeChecker, $typeHoverToggle} from '~/features/settings'
import {
  typeAtPosFx,
  typeNode,
  hideTypeNode,
  showTypeNode,
} from '~/features/flow'
import {retrieveCode, retrieveVersion} from './lib/retrieve'
import {compress} from './lib/compression'
import {$version, $sourceCode, $codeError} from './state'

export interface Location {
  file: string
  line: number
  column: number
}

export const evalFx = createEffect<string, any, any>()

export const performLint = createEvent()
export const changeSources = createEvent<string>()

export const selectVersion = createEvent<string>()

export const codeSetCursor = createEvent<Location>()
export const codeCursorActivity = createEvent<CM.Editor>()
export const codeMarkLine = createEffect<any, any, any>()

evalFx.use(evaluator)

$version.on(selectVersion, (_, version) => version)

codeCursorActivity.watch(editor => {
  const cursor = editor.getCursor()
  const body = editor.getValue()
  const line = cursor.line + 1
  const col = cursor.ch

  typeAtPosFx({
    filename: '/static/repl.js',
    body,
    line,
    col,
  })
})

sample({
  source: $typeHoverToggle,
  clock: codeCursorActivity,
  fn: (enabled, editor) => ({enabled, editor}),
}).watch(({enabled, editor}) => {
  const cursor = editor.getCursor()
  if (cursor.line === 0 && cursor.ch === 0) return
  if (enabled) {
    editor.addWidget(
      {
        line: cursor.line,
        ch: cursor.ch,
      },
      typeNode,
      false,
    )
    // @ts-ignore
    if (cursor.outside) {
      hideTypeNode()
    } else {
      showTypeNode()
    }
  }
})

forward({
  from: evalFx,
  to: resetGraphiteState,
})

$codeError
  .on(evalFx.done, () => ({
    isError: false,
    error: null,
    stackFrames: [],
  }))
  .on(evalFx.fail, (_, {error}) => {
    if ('stack' in error) {
      return {
        isError: true,
        error,
        stackFrames: [],
      }
    }
    return {
      isError: true,
      error: error.original,
      stackFrames: error.stackFrames,
    }
  })

// TODO: define exact type
let textMarker: any

$codeError.watch(async ({stackFrames}) => {
  if (textMarker) textMarker.clear()
  for (const frame of stackFrames) {
    if (frame._originalFileName !== 'repl.js') continue
    const line = (frame._originalLineNumber || 0) - 1
    const ch = frame._originalColumnNumber || 0
    textMarker = await codeMarkLine({
      from: {line, ch},
      options: {className: 'CodeMirror-lint-mark-error'},
    })
  }
})

let lastCode: null | string = null

changeSources.map(compress).watch(code => {
  if (lastCode !== null && lastCode !== code && code) {
    localStorage.setItem('code-compressed', code)
    history.replaceState({}, '', location.origin)
  }
  lastCode = code || lastCode
})

forward({
  from: changeSources,
  to: $sourceCode,
})

const initStore = combine({
  sourceCode: $sourceCode,
  versionLoader: $versionLoader,
  typechecker: $typeChecker,
})
initStore.watch(({sourceCode}) => {
  if (sourceCode) evalFx(sourceCode)
})

changeSources(retrieveCode()!)
selectVersion(retrieveVersion())
