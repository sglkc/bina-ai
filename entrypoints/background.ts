import { PromptMessage } from '@utils/types'
import { getAction, getActionRunner } from '@utils/runner'

let session: string | undefined

async function PromptRunner(msg: PromptMessage) {
  if (msg.reset) return session = undefined

  const { prompt } = msg
  const [{ url, id: tabId }] = await chrome.tabs.query({ active: true, currentWindow: true })

  if (!tabId) return

  const [injection] = await chrome.scripting.executeScript<any, string>({
    target: { tabId },
    files: ['content-scripts/markdown.js']
  })

  const page = injection.result

  const action = await getAction({ session, url, prompt, page })
  const runner = getActionRunner(action)

  session = action.session

  const [execution] = await chrome.scripting.executeScript({
    target: { tabId },
    func: runner,
    args: [action]
  })

  if (execution.result) {}

  console.info(JSON.stringify(action, null, 1))
}

export default defineBackground(() => {
  chrome.runtime.onMessage.addListener(async (msg) => {
    if (typeof msg === 'object' && msg.type && msg.type === 'prompt') return PromptRunner(msg)
  })

  console.log('Hello background!', { id: browser.runtime.id })
})
