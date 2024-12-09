function processPage() {
  const includeAttributes = ['href', 'alt', 'title', 'role', 'src', 'id', 'name', 'aria']
  const excludeTags = ['script', 'style', 'link', 'svg']

  const removeUnimportantAttributes = (element: Element) => {
    // Get all attributes of the element
    const attributes = element.attributes;

    // Iterate over the attributes in reverse order to avoid issues with live attribute lists
    for (let i = attributes.length - 1; i >= 0; i--) {
      const attribute = attributes[i];

      // Check if the attribute name is not in the list of important attributes
      if (!includeAttributes.includes(attribute.name)) {
        // Remove the attribute
        element.removeAttribute(attribute.name);
      }
    }
  }

  document.querySelectorAll(excludeTags.join()).forEach((elm) => elm.remove())
  document.querySelectorAll('*').forEach(removeUnimportantAttributes)

  return document.body.outerHTML
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

    console.info(result.result)
  })

  console.log('Hello background!', { id: browser.runtime.id });
});
