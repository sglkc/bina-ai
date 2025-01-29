import { ContentScriptMessage } from '@utils/types'

export default defineContentScript({
  matches: ['<all_urls>'],
  matchAboutBlank: true,
  runAt: 'document_start',
  registration: 'manifest',
  main: () => {
    const player = new Audio()

    const messageListener = (event: MessageEvent<ContentScriptMessage>) => {
      const msg = event.data

      if (
        typeof msg !== 'object' ||
          msg.origin !== chrome.runtime.id ||
          msg.type !== 'AUDIO'
      ) return

      if (!msg.audio && !player.paused) {
        player.pause()
        return
      }

      const audioUrl = '/audio/' + msg.audio + '.mp3'

      player.src = chrome.runtime.getURL(audioUrl)

      // fix play request interrupted & document not interacted
      player.play()
        .catch((err: Error) => {
          if (err.name === 'NotAllowedError') {
            window.postMessage({
              origin: chrome.runtime.id,
              type: 'NOTIFY',
              message: 'Interact with the document first to enable sounds',
            } satisfies ContentScriptMessage)

            return
          }

          player.play()
        })
    }

    window.addEventListener('message', messageListener)
    // console.log('registered audio content script')
  },
})
