import {createStore} from 'effector'

import defaultVersions from '~/versions.json'
import {StackFrame} from '~/features/evaluator'

import {retrieveCode} from './lib/retrieve'

type CodeError =
  | {
      isError: true
      error: Error
      stackFrames: StackFrame[]
    }
  | {
      isError: false
      error: null
      stackFrames: StackFrame[]
    }

export const $version = createStore<string>(defaultVersions[0])
export const $packageVersions = createStore<string[]>(defaultVersions)
export const $sourceCode = createStore(retrieveCode())
export const $compiledCode = createStore('')
export const $codeError = createStore<CodeError>({
  isError: false,
  error: null,
  stackFrames: [],
})
