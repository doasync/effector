import React from 'react'
import {
  createEvent,
  createEffect,
  combine,
  guard,
  sample,
  forward,
} from 'effector'

import {$sourceCode} from '~/features/editor/state'
import {
  $autoScrollLogs,
  $flowToggle,
  $tsToggle,
  $typeHoverToggle,
} from './state'

export const enableAutoScroll = createEvent()
export const disableAutoScroll = createEvent()

export const flowToggleChange = createEvent<
  React.ChangeEvent<HTMLInputElement>
>()
export const tsToggleChange = createEvent<React.ChangeEvent<HTMLInputElement>>()
export const typeHoverToggleChange = createEvent<
  React.ChangeEvent<HTMLInputElement>
>()

export const clickPrettify = createEvent<React.MouseEvent<HTMLButtonElement>>()

export const prettierFx = createEffect<
  {code: string; parser: 'flow' | 'typescript' | 'babel'},
  string,
  Error
>()

export const $typeChecker = combine($tsToggle, $flowToggle, (ts, flow) => {
  if (flow) return 'flow'
  if (ts) return 'typescript'
  return null
})

const handleChecked = (
  _: boolean,
  event: React.ChangeEvent<HTMLInputElement>,
) => event.currentTarget.checked

$flowToggle
  .on(flowToggleChange, handleChecked)
  .on(tsToggleChange, (checked, event) => {
    if (event.currentTarget.checked) return false
    return checked
  })

$tsToggle
  .on(tsToggleChange, handleChecked)
  .on(flowToggleChange, (checked, event) => {
    if (event.currentTarget.checked) return false
    return checked
  })

$typeHoverToggle.on(typeHoverToggleChange, handleChecked)

sample({
  source: {
    code: $sourceCode,
    parser: $typeChecker.map(parser => parser ?? 'babel'),
  },
  clock: guard(clickPrettify, {
    filter: prettierFx.pending.map(pending => !pending),
  }),
  target: prettierFx,
})

forward({
  from: prettierFx.done.map(({result}) => result),
  to: $sourceCode,
})

$autoScrollLogs
  .on(enableAutoScroll, _ => true)
  .on(disableAutoScroll, _ => false)

prettierFx.use(async({code, parser}) => {
  const req = await fetch('https://codebox.now.sh/prettier', {
    method: 'POST',
    body: JSON.stringify({code, config: {parser}}),
  })
  const result = await req.json()
  if (typeof result.code !== 'string') {
    console.error('prettier request error', result)
    throw Error('request failed')
  }
  return result.code
})
