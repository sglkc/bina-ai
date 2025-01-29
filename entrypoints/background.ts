import {
  ContentScriptMessage,
  Message,
  PromptMessage,
  SafeContentScriptMessage,
} from '@utils/types'
import { getAction, getActionRunner } from '@utils/runner'

const MAX_STEPS: number = 5
let session: string | undefined

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))

async function getActiveTab(): Promise<chrome.tabs.Tab> {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
    windowType: 'normal',
  })

  return tab ?? { id: 0 }
}

async function PromptRunner(msg: PromptMessage) {
  const { prompt } = msg
  let lastAction = undefined
  let lastPage = ''
  let steps = 0

  while (steps < MAX_STEPS) {
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

    // fetch action from api
    const action = await getAction({ session, url, prompt, page })
      .catch((err: Error) => {
        postMessage({
          type: 'NOTIFY',
          audio: 'error',
          message: 'Error occured while fetching agent: ' + err.name,
        })
      })

    if (!action) break

    // apply user session if empty
    if (!session)
      session = action.session

    postMessage({
      type: 'NOTIFY',
      audio: 'process',
      message: `[${action.action}] ${action.intent}`,
    })

    // wait a bit for response
    await sleep(3000)

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

    postMessage({
      type: 'NOTIFY',
      audio: 'process',
      message: 'Continuing agent...',
    })

    // await sleep(5000)
    lastPage = newPage
    steps++
  }

  postMessage({
    type: 'NOTIFY',
    audio: 'finish',
    message: 'Execution completed: ' + (lastAction ? lastAction.target : 'Max steps reached')
  })
}

async function postMessage(msg: ContentScriptMessage) {
  const { id: tabId } = await getActiveTab()

  if (!tabId) return

  const safeMsg = Object.assign({ origin: chrome.runtime.id }, msg)
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (msg: SafeContentScriptMessage) => window.postMessage(msg),
    args: [safeMsg]
  })
}

export default defineBackground(() => {
  const messageListener = async (msg: Message) => {
    if (typeof msg !== 'object' || !msg.type) return

    switch (msg.type) {
      case 'PROMPT':
        PromptRunner(msg)
        break
      case 'RESET-SESSION':
        session = undefined
        break
      case 'NOTIFY':
      case 'AUDIO':
        postMessage(msg)
        break
      default:
        console.error('Undefined message type', msg)
    }
  }

  chrome.runtime.onMessage.addListener(messageListener)

  // ensure microphone permission for speech recognition on first install
  chrome.runtime.onInstalled.addListener((e) => {
    if (e.reason === chrome.runtime.OnInstalledReason.INSTALL)
      chrome.runtime.openOptionsPage()
  })
})
