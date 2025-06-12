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

      Toastify({
        position: 'left',
        duration: 5000,
        // tts already integrated, no need for screen reader
        ariaLive: 'off',
        style: {
          padding: '1.5rem',
          fontSize: '1.5rem',
          fontWeight: 'bold',
        },
        text: msg.message,
      }).showToast()
    })

    // console.log('registered toast content script')
  },
})
