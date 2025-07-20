import Toastify from 'toastify-js'
import 'toastify-js/src/toastify.css'
import '@fontsource/open-sauce-one/400.css'
import '@fontsource/open-sauce-one/700.css'

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
        duration: 15_000,
        // tts already integrated, no need for screen reader
        ariaLive: 'off',
        style: {
          fontFamily: '"Open Sauce One", sans-serif',
          background: '#fff',
          color: '#333',
          border: '2px solid #333',
          borderRadius: '1rem',
          boxShadow: 'none',
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
