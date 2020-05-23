import {createDomain} from 'effector'

const domain = createDomain()

export const $autoScrollLogs = domain.createStore(false)
export const $flowToggle = domain.createStore(false)
export const $tsToggle = domain.createStore(false)
export const $typeHoverToggle = domain.createStore(false)

domain.onCreateStore(store => {
  const snapshot = localStorage.getItem(store.compositeName.fullName)
  if (snapshot != null) {
    const data = JSON.parse(snapshot)
    store.setState(data)
  }

  store.updates.watch(newState => {
    localStorage.setItem(store.compositeName.fullName, JSON.stringify(newState))
  })
  return store
})
