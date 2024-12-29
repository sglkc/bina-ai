export default defineBackground(() => {
  chrome.runtime.onMessage.addListener(async (msg) => {
    if (typeof msg !== 'object') return
    if (msg.type !== 'prompt') return

    const { question } = msg as { type: 'prompt', question: string }
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

    if (!tab.id) return

    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content-scripts/markdown.js']
    })

    const page = result.result

    const res = await fetch('http://localhost:5000/prompt', {
      method: 'post',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        type: 'markdown',
        question,
        page
      })
    })

    const json = await res.json()

    console.log(json)
  })

  console.log('Hello background!', { id: browser.runtime.id })
})
