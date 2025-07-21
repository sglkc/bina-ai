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
    chrome.storage.session.onChanged.addListener((changes) => {
      if (changes.toastMessage && changes.toastMessage.newValue) {
        const msg = changes.toastMessage.newValue
        
        Toastify({
          position: 'left',
          duration: 5_000,
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
          text: msg,
        }).showToast()

        // Clear the toast message after showing
        chrome.storage.session.remove('toastMessage')
      }
    })

    // console.log('registered toast content script')
  },
})
