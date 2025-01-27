import { AudioMessage } from '@utils/types'

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  registration: 'manifest',
  main: () => {
    const player = new Audio()

    const messageListener = (event: MessageEvent<AudioMessage>) => {
      const msg = event.data

      if (typeof msg !== 'object' || msg.type !== 'AUDIO') return

      const audioUrl = '/audio/' + (msg.audio ?? 'next_step') + '.mp3'

      player.src = chrome.runtime.getURL(audioUrl)
      player.play()
    }

    window.addEventListener('message', messageListener)
    // console.log('registered audio content script')
  },
})
