import { Message } from '@utils/types'

export default defineContentScript({
  matches: ['<all_urls>'],
  matchAboutBlank: true,
  runAt: 'document_start',
  registration: 'manifest',
  main: () => {
    const player = new Audio()

    chrome.runtime.onMessage.addListener((msg: Message, sender) => {
      if (
        typeof msg !== 'object' ||
          sender.id !== chrome.runtime.id ||
          msg.type !== 'AUDIO'
      ) return

      if (!msg.audio) {
        player.pause()
        return
      }

      const audioUrl = '/audio/' + msg.audio + '.mp3'

      player.src = chrome.runtime.getURL(audioUrl)

      // fix play request interrupted & document not interacted
      player.play()
        .catch((err: Error) => {
          if (err.name === 'NotAllowedError') {
            // TODO: send notification for error??
            // chrome.runtime.sendMessage({
            //   type: 'NOTIFY',
            //   message: 'Interact with the document first to enable sounds',
            // } satisfies Message)
            //
            return
          }

          player.play()
        })
    })

    // console.log('registered audio content script')
  },
})
