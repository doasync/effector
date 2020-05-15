import React from 'react'
import {styled} from 'linaria/react'
import {useStore} from 'effector-react'

import {LoadingIcon} from '~/ui/icons'
import {
  $shareDescription,
  handleInput,
  handleKeyDown,
  shareCodeFx,
} from '../model'
import {ShareGroup, ShareButton} from './share'

export const SharePanel = () => {
  const shareDescription = useStore($shareDescription)
  const saving = useStore(shareCodeFx.pending)

  return (
    <ShareGroup>
      <Section
        style={{
          backgroundColor: '#f0f0f0',
          padding: 10,
          display: 'flex',
          alignItems: 'center',
          margin: 0,
          border: 'none',
          borderBottom: '1px solid #ddd',
        }}>
        <ValidatedInput
          type="text"
          className="share-description"
          style={{width: '100%', padding: 4, height: 32}}
          placeholder="Share description required"
          value={shareDescription || ''}
          onKeyDown={handleKeyDown}
          onChange={handleInput}
          autoFocus={false}
          required
        />
        <Save disabled={saving} />
      </Section>

      <Section
        style={{
          margin: 0,
          padding: 0,
          overflowY: 'auto',
          borderTop: 'none',
          borderBottom: 'none',
          height: 'calc(100% - 54px)',
        }}>
        <ShareList />
      </Section>
    </ShareGroup>
  )
}

const Save: React.FC<{disabled?: boolean}> = props => {
  const pending = useStore(shareCodeFx.pending)
  return (
    <ShareButton
      {...props}
      onClick={shareCodeFx}
      disabled={props.disabled || pending}>
      {pending && <LoadingIcon style={{marginRight: 10}} />}
      Save
    </ShareButton>
  )
}

export const Section = styled.section`
  background-color: #fff;
  border-bottom: 15px solid #f7f7f7;

  & + & {
    border-top: 1px solid #ddd;
  }
`

const ValidatedInput = styled.input`
  outline: none;
  border: none;
  box-shadow: 0 0 1px black;
  :invalid {
    box-shadow: 0 0 4px red;
  }
`
