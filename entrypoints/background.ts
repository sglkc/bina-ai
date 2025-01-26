import { PromptMessage } from '@utils/types'
import { getAction, getActionRunner } from '@utils/runner'

const MAX_STEPS: number = 5
let session: string | undefined

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))

async function getTabPage(tabId: number): Promise<string> {
  const [injection] = await chrome.scripting.executeScript<any, string>({
    target: { tabId },
    files: ['content-scripts/markdown.js']
  })

  return injection.result ?? ''
}

async function PromptRunner(msg: PromptMessage) {
  if (msg.reset) return session = undefined

  const { prompt } = msg

  let steps = 0

  while (steps < MAX_STEPS) {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
      windowType: 'normal',
    })

    if (!tab) {
      await sleep(5000)
      steps++
      continue
    }

    const { id: tabId, url, status } = tab

    if (!tabId) {
      await sleep(5000)
      steps++
      continue
    }

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

    const page = await getTabPage(tabId)
    const action = await getAction({ session, url, prompt, page })
    const runner = getActionRunner(action)

    if (!session)
      session = action.session

    const [execution] = await chrome.scripting.executeScript({
      target: { tabId },
      func: runner,
      args: [action]
    })

    console.info(JSON.stringify(action, null, 1))

    if (!execution.result) {
      console.error('execution ended')
      break
    }

    // await sleep(5000)
    steps++
  }
}

export default defineBackground(() => {
  chrome.runtime.onMessage.addListener(async (msg) => {
    if (typeof msg === 'object' && msg.type && msg.type === 'prompt') return PromptRunner(msg)
  })

  console.log('Hello background!', { id: browser.runtime.id })
})
