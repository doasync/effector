import {createLocalStore} from '~/lib/local-store'

export interface UserInfo {
  databaseId: string | null
  name: string
  url: string
  avatarUrl: string
}

export const $csrf = createLocalStore('csrf', '')
export const $githubToken = createLocalStore<string | null>(
  'github-token',
  null,
)
export const $githubUser = createLocalStore<UserInfo>('github-user', {
  databaseId: null,
  avatarUrl: '',
  name: '',
  url: '',
})
