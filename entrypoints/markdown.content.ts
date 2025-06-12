import { convertHtmlToMarkdown } from 'dom-to-semantic-markdown'

export default defineContentScript({
  matches: ['<all_urls>'],
  registration: 'runtime',
  main: () => convertHtmlToMarkdown(
    document.documentElement.outerHTML,
    {}
  )
    .replace(/---\n\n---\n|\n{3,}/g, '\n')
    .split('\n')
    .filter((line, index, array) => !(
      line.trim() === '' &&
        (index === 0 || array[index - 1].trim() === '') &&
        (index === array.length - 1 || array[index + 1].trim() === '')
    ))
    .join('\n')
})
