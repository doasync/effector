import {ChangeEvent, KeyboardEvent, createRef} from 'react'
import {
  createStore,
  createEvent,
  createEffect,
  forward,
  sample,
  guard,
  attach,
  Effect,
  Store,
  Event,
  combine,
  split,
} from 'effector'
import md5 from 'js-md5'
import {createLocalStore} from '~/lib/local-store'
import {$githubUser, UserInfo} from '~/features/github'
import {$sourceCode} from '~/features/editor'

const ENDPOINT = {
  DIST: 'y6776i4nfja2lnx3gbkbmlgr3i',
  REGION: 'us-east-1',
  PUBLIC_API_KEY: 'da2-srl2uzygsnhpdd2bban5gscnza',
}

type NewShare = {
  author: string
  code: string
  created: number
  description: string
  md5: string
  slug: string
}

type SavedShare = Exclude<NewShare, 'code'>

export const urlRef = createRef<any>()

export const saveShare = createEvent()
export const removeShare = createEvent<string>()
export const addShare = createEvent<NewShare>()
export const getShareList = createEvent()
export const setCurrentShareId = createEvent<string>()
export const copyToClipboard = createEvent()
export const handleInput = createEvent<ChangeEvent<HTMLInputElement>>()
export const handleKeyDown = createEvent<KeyboardEvent<HTMLInputElement>>()
export const pressCtrlS = createEvent()
export const clickShare = createEvent()

export const onTextChange = handleInput.map(event => event.target.value)
export const onKeyDown = handleKeyDown.map(event => event.key)

export const $shareList = createLocalStore<
  Record<string, Record<string, SavedShare>>
>('share-list', {})
export const $currentShareId = createStore<string | null>(null)
export const $shareDescription = createStore('')
export const $slug = createStore('')
export const $sharedUrl = createStore('')

export const $canShare = $slug.map(url => url !== '')

const $sharesWithUser = combine({
  shareList: $shareList,
  githubUser: $githubUser,
})

export const $sortedShareList = $sharesWithUser.map(
  ({shareList, githubUser}) => {
    if (!(githubUser.databaseId! in shareList)) return []

    return Object.values(shareList[githubUser.databaseId!] || {})
      .filter(share => share.author === githubUser.databaseId)
      .sort((a, b) => b.created - a.created)
  },
)

const shareInternalFx = createEffect<
  {
    author: string | null
    description: string | null
    code: string | null
  },
  {slug: string}
>()
export const sharingFx = createEffect<
  {
    slug: string
    sharedUrl: string
  },
  void
>()

const unexpectedSharingError = sharingFx.fail.filter({
  fn: ({error}) => error.name !== 'AbortError',
})

const keyDown = split(onKeyDown, {
  Escape: key => key === 'Escape',
  Enter: key => key === 'Enter',
})

export const shareCodeFx = attach({
  effect: shareInternalFx,
  source: combine({
    user: $githubUser,
    description: $shareDescription,
    sourceCode: $sourceCode,
  }),
  mapParams: (_: any, {user, description, sourceCode}) => ({
    author: user ? user.databaseId : null,
    description,
    code: sourceCode,
  }),
})

const request = (data: any) => {
  const url = `https://${ENDPOINT.DIST}.appsync-api.${ENDPOINT.REGION}.amazonaws.com/graphql`
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ENDPOINT.PUBLIC_API_KEY,
    },
    body: JSON.stringify(data),
  })
    .then(req => req.json())
    .then(result => {
      if ('errors' in result) {
        console.error(result.errors)
        throw Error('request exception')
      }
      return result.data
    })
}

shareInternalFx.use(async params => {
  const description = params.description || undefined
  const author = params.author || undefined
  const code = params.code
  const {createCodePage} = await request({
    query: `
        mutation ReplMutation($codePage: CodePageInput!) {
          createCodePage(codePage: $codePage) {
            slug
            description
            author
            created
            code
          }
        }
      `,
    variables: {
      codePage: {author, description, code},
    },
    operationName: 'ReplMutation',
  })
  addShare({
    ...createCodePage,
    md5: md5(createCodePage.code),
  })
  return createCodePage
})

sharingFx.use(async ({slug, sharedUrl}) => {
  if ('share' in navigator) {
    // @ts-ignore
    await navigator.share({
      title: `Share URL ${slug}`,
      url: sharedUrl,
    })
    return
  }
  const ref = urlRef.current
  if (!ref) return
  ref.select()
  document.execCommand('copy')
})

document.addEventListener(
  'keydown',
  event => {
    if ((event.metaKey || event.ctrlKey) && event.keyCode === 83) {
      event.preventDefault()
      pressCtrlS()
    }
  },
  false,
)

forward({
  from: guard(pressCtrlS, {
    filter: shareCodeFx.pending.map(pending => !pending),
  }),
  to: shareCodeFx,
})

shareCodeFx.done.watch(({result: {slug}}) => {
  history.pushState({slug}, slug, `${location.origin}/${slug}`)
  setCurrentShareId(slug)
})

$slug.on(shareCodeFx.done, (_, {result}) => result.slug)
$sharedUrl.on($slug, (_, slug) => `${location.origin}/${slug}`)

shareCodeFx.fail.watch(error => console.warn('shareCodeFx.fail', error))

unexpectedSharingError.watch(({error}) => {
  console.error('unexpectedSharingError', error)
})

sample({
  source: {slug: $slug, sharedUrl: $sharedUrl},
  clock: clickShare,
  target: sharingFx,
})

$currentShareId.on(setCurrentShareId, (_, id) => id)

forward({
  from: keyDown.Enter,
  to: shareCodeFx,
})

$shareDescription.on(onTextChange, (_, value) => value).reset(keyDown.Escape)

sample({
  source: $sharesWithUser,
  clock: $currentShareId,
  target: $shareDescription,
  fn({shareList, githubUser}, slug) {
    if (githubUser.databaseId) {
      const userShares = shareList[githubUser.databaseId]
      const currentShare = Object.values(userShares || {}).find(
        share => share.slug === slug,
      )
      return currentShare?.description || ''
    }
    return ''
  },
})

sample({
  source: $sharesWithUser,
  clock: addShare,
  target: $shareList,
  fn({shareList, githubUser}, newShare) {
    const {code, ...rest} = newShare
    if (githubUser.databaseId) {
      return {
        ...shareList,
        [githubUser.databaseId]: {
          ...shareList[githubUser.databaseId],
          [newShare.md5]: rest as SavedShare,
        },
      }
    }
    return shareList
  },
})

sample({
  source: $sharesWithUser,
  clock: removeShare,
  target: $shareList,
  fn({shareList, githubUser}, slug) {
    if (githubUser.databaseId) {
      return {
        ...shareList,
        [githubUser.databaseId]: {
          ...Object.values(shareList[githubUser.databaseId] || {}).reduce(
            (acc, share) => {
              if (share.slug !== slug) {
                acc[share.md5] = share
              }
              return acc
            },
            {} as Record<string, SavedShare>,
          ),
        },
      }
    }
    return shareList
  },
})
