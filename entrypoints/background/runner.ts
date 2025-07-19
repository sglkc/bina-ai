import { controller, getAction, getActionRunner } from './actions'
import { handleMessage } from './index'
import { getActiveTab, playTTS, sleep } from './utils'

let session: string | undefined

let maxSteps: number = 5

let stopped: boolean = false

async function run(msg: PromptMessage): Promise<void> {
  const { prompt } = msg
  let lastAction = undefined
  let lastPage = ''
  let steps = 0

  session = crypto.randomUUID()

  while (steps < maxSteps) {
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

    if (!session) return

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

    if (!session) return

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

  playTTS(message)
  handleMessage({
    type: 'NOTIFY',
    audio: 'finish',
    message: __('notification.done', [message])
  })
}

function stop() {
  controller.abort()
  stopped = true
}

export default {
  session,
  maxSteps,
  run,
  stop,
}
