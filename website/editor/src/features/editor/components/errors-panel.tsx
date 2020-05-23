import React from 'react'
import {useStore} from 'effector-react'
import {styled} from 'linaria/react'

import {Header} from '~/ui'
import {$codeError} from '../model'
import {StackFrame} from './stack-frame'

export const ErrorsPanel = () => {
  const {isError, error, stackFrames} = useStore($codeError)
  if (isError && error) {
    if (error !== Object(error)) {
      return (
        <pre key="error-window" className="errors has-errors">
          <Header headerText={String(error)} />
        </pre>
      )
    }
    const errorName = error.name
    const message = error.message
    const headerText =
      message.match(/^\w*:/) || !errorName ? message : errorName
    return (
      <pre key="error-window" className="errors has-errors">
        <Header headerText={headerText} />
        {errorName && (
          <Message scroll={stackFrames.length === 0}>{message}</Message>
        )}
        {stackFrames.length > 0 && (
          <StackTrace>
            {stackFrames.map(frame => (
              <StackFrame frame={frame} />
            ))}
          </StackTrace>
        )}
      </pre>
    )
  }
  return <pre key="error-window" className="errors no-errors" />
}

const StackTrace = styled.div`
  /*overflow: auto;*/
`

const Message = styled.div<{scroll?: boolean}>`
  /* overflow: ${props => (props.scroll ? 'auto' : 'none')}; */
  /* margin-bottom: 1.5em; */
`
