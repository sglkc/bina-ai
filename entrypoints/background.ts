export default defineBackground(() => {
  chrome.runtime.onMessage.addListener(async (msg) => {
    if (msg !== 'process') return

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

    if (!tab.id) return

    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content-scripts/markdown.js']
    })

    const md = result.result

    console.log(md)

    // const res = await fetch('http://localhost:5000/minifier', {
    //   method: 'post',
    //   body: result.result
    // })
    //
    // const html = await res.text()
    //
    // console.log(html)
  })

  console.log('Hello background!', { id: browser.runtime.id })
})
