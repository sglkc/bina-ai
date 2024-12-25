function processPage() {
  const dom = new DOMParser().parseFromString(document.body.outerHTML, 'text/html')
  const includeAttributes = ['href', 'alt', 'title', 'role', 'src', 'id', 'name', 'aria']
  const excludeTags = ['script', 'style', 'link', 'svg', 'iframe', 'noscript']

  const removeUnimportantAttributes = (element: Element) => {
    const attributes = element.attributes

    for (let i = attributes.length - 1; i >= 0; i--) {
      const attribute = attributes[i]

      if (!includeAttributes.includes(attribute.name)) {
        element.removeAttribute(attribute.name)
      }
    }
  }

  dom.querySelectorAll(excludeTags.join()).forEach((elm) => elm.remove())
  dom.querySelectorAll('*').forEach(removeUnimportantAttributes)

  for (const element of dom.body.children) {
    for (const child of element.children) {
      if (!child.childNodes.length || !child.textContent?.trim()) {
        element.remove()
        continue
      }
      dom.body.appendChild(child)
    }
  }

  return dom.body.outerHTML
}

export default defineBackground(() => {
  chrome.runtime.onMessage.addListener(async (msg) => {
    if (msg !== 'process') return

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

    if (!tab.id) return

    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: processPage
    })

    console.log(result.result)

    const res = await fetch('http://localhost:5000/minifier', {
      method: 'post',
      body: result.result
    })

    const html = await res.text()

    console.log(html)
  })

  console.log('Hello background!', { id: browser.runtime.id })
})
