import { handleMessage } from './index'

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))

export async function getActiveTab(): Promise<chrome.tabs.Tab> {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      windowType: 'normal',
    })

    return tab
  } catch {
    // @ts-expect-error: additional check on id
    return { id: 0 }
  }
}

export async function playTTS(text: string): Promise<void> {
  return new Promise((resolve) => {
    const handler = (msg: Message) => {
      if (msg.type !== 'TTS' || msg.kind === 'text') return
      chrome.runtime.onMessage.removeListener(handler)
      resolve()
    }

    chrome.runtime.onMessage.addListener(handler)
    handleMessage({ type: 'TTS', kind: 'text', text })
  })
}
