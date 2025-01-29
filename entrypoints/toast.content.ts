import { Message } from '@utils/types'
import Toastify from 'toastify-js'
import 'toastify-js/src/toastify.css'

export default defineContentScript({
  matches: ['<all_urls>'],
  matchAboutBlank: true,
  runAt: 'document_start',
  registration: 'manifest',
  main: () => {
    chrome.runtime.onMessage.addListener((msg: Message, sender) => {
      if (
        typeof msg !== 'object' ||
          sender.id !== chrome.runtime.id ||
          msg.type !== 'NOTIFY'
      ) return

      Toastify({ text: msg.message }).showToast()
    })

    // console.log('registered toast content script')
  },
})
