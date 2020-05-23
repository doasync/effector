import React from 'react'
import {styled} from 'linaria/react'
import {StackFrame as StackFrameType} from '~/features/evaluator'

export const StackFrame: React.FC<{frame: StackFrameType}> = ({frame}) => {
  const {
    fileName,
    lineNumber,
    columnNumber,
    _originalFileName: sourceFileName,
    _originalLineNumber: sourceLineNumber,
    _originalColumnNumber: sourceColumnNumber,
  } = frame
  const functionName = frame.getFunctionName()
  const url = getPrettyURL(
    sourceFileName,
    sourceLineNumber,
    sourceColumnNumber,
    fileName,
    lineNumber,
    columnNumber,
    false,
  )
  return (
    <div>
      <div>{functionName}</div>
      <Link>{url}</Link>
    </div>
  )
}

const Link = styled.div`
  font-size: 0.9em;
  margin-bottom: 0.9em;
`

function getPrettyURL(
  sourceFileName: string | null,
  sourceLineNumber: number | null,
  sourceColumnNumber: number | null,
  fileName: string | null,
  lineNumber: number | null,
  columnNumber: number | null,
  compiled: boolean | null,
): string {
  let prettyURL
  if (!compiled && sourceFileName && typeof sourceLineNumber === 'number') {
    // Remove everything up to the first /src/ or /node_modules/
    const trimMatch = /^[/|\\].*?[/|\\]((src|node_modules)[/|\\].*)/.exec(
      sourceFileName,
    )
    if (trimMatch && trimMatch[1]) {
      prettyURL = trimMatch[1]
    } else {
      prettyURL = sourceFileName
    }
    prettyURL += ':' + sourceLineNumber
    // Note: we intentionally skip 0's because they're produced by cheap Webpack maps
    if (sourceColumnNumber) {
      prettyURL += ':' + sourceColumnNumber
    }
  } else if (fileName && typeof lineNumber === 'number') {
    prettyURL = fileName + ':' + lineNumber
    // Note: we intentionally skip 0's because they're produced by cheap Webpack maps
    if (columnNumber) {
      prettyURL += ':' + columnNumber
    }
  } else {
    prettyURL = 'unknown'
  }
  return prettyURL.replace('webpack://', '.')
}
