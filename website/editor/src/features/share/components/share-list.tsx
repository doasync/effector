import React from 'react'
import {styled} from 'linaria/react'
import {useStore} from 'effector-react'

import {CopyIcon, ShareIcon} from '~/ui/icons'
import {IconButton} from '~/ui'
import {theme} from '~/features/logs'
import {
  $sortedShareList,
  $currentShareId,
  sharingFx,
  setCurrentShareId,
  removeShare,
} from '../model'

export const ShareList = () => {
  const sortedShareList = useStore($sortedShareList)
  const currentShareId = useStore($currentShareId)

  if (sortedShareList.length === 0) {
    return (
      <h2
        style={{
          color: '#aaa',
          fontWeight: 'bold',
          textAlign: 'center',
          marginTop: 30,
        }}>
        No shares found by the author
      </h2>
    )
  }

  return sortedShareList.map(share => {
    const strDate = createDateString(share)

    const shareLink = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        event.stopPropagation()

        sharingFx({
          slug: share.slug,
          sharedUrl: `https://share.effector.dev/${share.slug}`,
        })
      },
      [],
    )

    const copyLink = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        event.stopPropagation()

        const tmp = document.createElement('input')
        tmp.contentEditable = 'true'
        tmp.readOnly = false
        tmp.value = `${location.origin}/${share.slug}`
        document.body.appendChild(tmp)
        tmp.select()
        document.execCommand('copy')
        document.body.removeChild(tmp)
        // @ts-ignore
        window.scrollY = 0
      },
      [],
    )

    return (
      <ShareItem
        key={share.slug}
        onClick={() => setCurrentShareId(share.slug)}
        active={currentShareId === share.slug}
        href={`${location.origin}/${share.slug}`}
        style={{
          color:
            currentShareId === share.slug ? 'var(--primary-color)' : '#333',
        }}>
        <ShareRow>
          <ShareDescription>
            {share.description || `<${share.slug}>`}
          </ShareDescription>
          <div style={{marginLeft: 10, position: 'relative'}}>
            {'share' in navigator ? (
              <MiniButton title="Share" onClick={shareLink}>
                <ShareIcon width="20px" height="20px" />
              </MiniButton>
            ) : (
              <MiniButton title="Copy to clipboard" onClick={copyLink}>
                <CopyIcon width="20px" height="20px" />
              </MiniButton>
            )}
            <IconButton
              title="Delete"
              icon={theme.styles.TRASH_ICON}
              style={{
                position: 'absolute',
                right: 0,
                width: 24,
                height: 24,
                fill: 'red',
              }}
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                if (confirm('Are you sure delete this share?')) {
                  removeShare(share.slug)
                }
              }}
            />
          </div>
        </ShareRow>
        <ShareRow>
          <ShareDate>{strDate}</ShareDate>
        </ShareRow>
      </ShareItem>
    )
  })
}

function createDateString(share: {created: number}) {
  const d = new Date(share.created * 1000)
  const DD = String(d.getDate()).padStart(2, '0')
  const MM = String(d.getMonth()).padStart(2, '0')
  const YYYY = String(d.getFullYear())
  const HH = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${YYYY}-${MM}-${DD} ${HH}:${mm}`
}

interface ShareItemProps {
  active?: boolean
  onClick: Function
  href: string
  style: object
}
const ShareItem = styled.a<ShareItemProps>`
  display: block;
  padding: 5px 10px;
  border-bottom: 1px solid #eee;
  border-left: 3px solid
    ${props => (props.active ? 'var(--primary-color)' : 'transparent')};
`

const ShareRow = styled.div`
  cursor: pointer;
  background-color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const ShareDate = styled.div`
  text-align: left;
  color: #999;
  font-size: 12px;
`

const ShareDescription = styled.div`
  flex: 1 1 100%;
  white-space: nowrap;
  &:hover {
    color: var(--link-color);
  }
`

const MiniButton = styled.button`
  color: #888888;
  border: none;
  outline: none;
  background-color: transparent !important;
  border-radius: 5px;
  width: 24px;
  height: 24px;
  cursor: pointer;
  position: absolute;
  right: 40px;
  padding: 2px 0;
  &:hover {
    color: var(--link-color);
  }
`
