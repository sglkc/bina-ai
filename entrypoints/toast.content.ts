import { NotifyMessage } from '@utils/types'
import Toastify from 'toastify-js'
import 'toastify-js/src/toastify.css'

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  registration: 'manifest',
  main: () => {
    const messageListener = (event: MessageEvent<NotifyMessage>) => {
      const msg = event.data

      if (typeof msg !== 'object' || msg.type !== 'NOTIFY') return

      Toastify({ text: msg.message }).showToast()

      window.postMessage({
        type: 'AUDIO',
        audio: msg.audio ?? 'next_step',
      } satisfies AudioMessage)
    }

    window.addEventListener('message', messageListener)
    // console.log('registered toast content script')
  },
})
