import { SafeContentScriptMessage } from '@utils/types'
import Toastify from 'toastify-js'
import 'toastify-js/src/toastify.css'

export default defineContentScript({
  matches: ['<all_urls>'],
  matchAboutBlank: true,
  runAt: 'document_start',
  registration: 'manifest',
  main: () => {
    const messageListener = (event: MessageEvent<SafeContentScriptMessage>) => {
      const msg = event.data

      if (
        typeof msg !== 'object' ||
          msg.origin !== chrome.runtime.id ||
          msg.type !== 'NOTIFY'
      ) return

      Toastify({ text: msg.message }).showToast()

      window.postMessage({
        origin: chrome.runtime.id,
        type: 'AUDIO',
        audio: msg.audio,
      } satisfies SafeContentScriptMessage)
    }

    window.addEventListener('message', messageListener)
    // console.log('registered toast content script')
  },
})
