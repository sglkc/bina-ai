import runner from './runner'

function createOffscreen(msg: AudioMessage | TTSMessage) {
  const params = new URLSearchParams({ lang: __('lang') })

  if (msg.type === 'TTS' && msg.kind === 'text')
    params.set('text', msg.text)

  if (msg.type === 'AUDIO' && msg.audio)
    params.set('audio', msg.audio)

  chrome.offscreen.createDocument({
    url: `/offscreen.html?${params.toString()}`,
    reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
    justification: 'autoplay can not play'
  }).catch(() => null)
}

export async function handleMessage(msg: Message) {
  if (typeof msg !== 'object' || !msg.type) return

  // forward to other things (popup or offscreen)
  chrome.runtime.sendMessage(msg).catch(() => null)

  switch (msg.type) {
    case 'STOP':
      runner.stop()
      break
    case 'PROMPT':
      runner.run(msg)
      break
    case 'RESET-SESSION':
      await chrome.storage.session.remove('runnerSession')
      console.log('reseted session')
      break
    case 'NOTIFY':
      // Send toast message via storage
      if (msg.message) {
        chrome.storage.session.set({ toastMessage: msg.message })
      }
      // forward audio
      if (msg.audio) {
        handleMessage({
          type: 'AUDIO',
          audio: msg.audio
        })
      }
      break
    case 'AUDIO':
    case 'TTS':
      createOffscreen(msg)
      break
    default:
      console.error('Undefined message type', msg)
  }
}

export default defineBackground(() => {
  chrome.runtime.onMessage.addListener(handleMessage)

  // commands for shortcut keys
  chrome.commands.onCommand.addListener((command) => {
    if (command === 'open-popup') {
      chrome.action.openPopup().catch(() => null)
    }
  })

  // ensure microphone permission for speech recognition on first install
  chrome.runtime.onInstalled.addListener((e) => {
    if (e.reason === chrome.runtime.OnInstalledReason.INSTALL)
      // if (import.meta.env.PROD)
      chrome.runtime.openOptionsPage()
  })

  chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' })
})
