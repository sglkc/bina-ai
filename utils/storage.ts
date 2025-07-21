export const toastStorage = storage.defineItem<string>('session:toast', { init: () => '' })

export const runningStorage = storage.defineItem<boolean>('session:running', { init: () => false })
