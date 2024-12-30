interface PromptMessage {
  type: 'prompt'
  prompt?: string
  reset?: boolean
}

interface PromptResponse {
  session: string
  intent: string
  action: string
  target?: string
}

export default defineBackground(() => {
  let session: string | undefined

  chrome.runtime.onMessage.addListener(async (msg: PromptMessage) => {
    if (typeof msg !== 'object' || msg.type !== 'prompt') return
    if (msg.reset) return void (session = undefined)

    const { prompt } = msg
    const [{ url, id: tabId }] = await chrome.tabs.query({ active: true, currentWindow: true })

    if (!tabId) return

    const [injection] = await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content-scripts/markdown.js']
    })

    const page = injection.result

    const res = await fetch('http://localhost:5000/prompt', {
      method: 'post',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        session,
        url,
        prompt,
        page
      })
    })

    const json: PromptResponse = await res.json()
    session = json.session

    console.info(JSON.stringify(json, null, 1))
  })

  console.log('Hello background!', { id: browser.runtime.id })
})
