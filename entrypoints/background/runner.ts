import { controller, getAction, getActionRunner } from './actions'
import { handleMessage } from './index'
import { getActiveTab, playTTS, sleep } from './utils'

let maxSteps: number = 5

let stopped: boolean = false

async function getSession(): Promise<string | undefined> {
  const result = await chrome.storage.session.get('runnerSession')
  return result.runnerSession
}

async function setSession(sessionId: string): Promise<void> {
  await chrome.storage.session.set({ runnerSession: sessionId })
}

async function clearSession(): Promise<void> {
  await chrome.storage.session.remove('runnerSession')
}

async function run(msg: PromptMessage): Promise<void> {
  const { prompt } = msg
  let lastAction = undefined
  let lastPage = ''
  let steps = 0

  const sessionId = crypto.randomUUID()
  await setSession(sessionId)
  
  // Set runner status in session storage
  await chrome.storage.session.set({ runnerActive: true })

  while (steps < maxSteps) {
    // Check if session still exists, stop if cleared
    const currentSession = await getSession()
    if (!currentSession) return

    // wait for tab id if empty
    const { id: tabId, url, status } = await getActiveTab()

    if (!tabId) {
      await sleep(5000)
      steps++
      continue
    }

    // wait for tab loading (TODO: timeout?)
    if (status !== 'complete') {
      let callback: any = (res: Function) =>
        (id: number, info: chrome.tabs.TabChangeInfo) => {
          if (id !== tabId || info.status !== 'complete') return
          res()
        }

      console.log('waiting loading')
      await new Promise<void>((res) => {
        callback = callback(res)
        chrome.tabs.onUpdated.addListener(callback)
      })

      chrome.tabs.onUpdated.removeListener(callback)
      console.log('finished loading')
    }

    // get page and compare if changed
    const [injection] = await chrome.scripting.executeScript<any, string>({
      target: { tabId },
      files: ['content-scripts/markdown.js']
    })

    const newPage = injection.result ?? ''
    const page = newPage !== lastPage ? newPage : undefined

    // Check session again before API call
    const sessionCheck = await getSession()
    if (!sessionCheck) return

    // fetch action from api
    const action = await getAction({ url, prompt, page })
      .catch((err: Error) => {
        handleMessage({
          type: 'NOTIFY',
          audio: 'error',
          message: __('notification.api_error', [err.name]),
        })
      })

    if (!action) break

    // Check session again before action execution
    const sessionCheck2 = await getSession()
    if (!sessionCheck2) return

    if (action.intent !== action.target) {
      handleMessage({
        type: 'NOTIFY',
        audio: 'process',
        message: `[${action.action}] ${action.intent}`,
      })

      // wait a bit for response
      await playTTS(action.intent)
    }

    // run action to user page
    const runner = getActionRunner(action)
    const [execution] = await chrome.scripting.executeScript({
      target: { tabId },
      func: runner,
      args: [action]
    })

    console.info(JSON.stringify(action, null, 1))

    if (!execution.result) {
      lastAction = action
      break
    }

    // wait a bit for response
    await sleep(3000)

    handleMessage({
      type: 'NOTIFY',
      audio: 'process',
      message: __('notification.continuing_ai'),
    })

    // await sleep(5000)
    lastPage = newPage
    steps++

    if (stopped) {
      stopped = false
      break
    }
  }

  const message = lastAction && lastAction.target ? lastAction.target : __('notification.max_steps_reached')

  // Clear session and runner status from session storage
  await clearSession()
  await chrome.storage.session.remove('runnerActive')

  playTTS(message)
  handleMessage({
    type: 'NOTIFY',
    audio: 'finish',
    message: __('notification.done', [message])
  })
}

async function stop() {
  controller.abort()
  stopped = true
  // Clear session and runner status when stopped
  await clearSession()
  await chrome.storage.session.remove('runnerActive')
}

export default {
  getSession,
  maxSteps,
  run,
  stop,
}
