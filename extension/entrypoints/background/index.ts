import runner from './runner'
import { getActiveTab } from './utils'

export async function handleMessage(msg: Message) {
  if (typeof msg !== 'object' || !msg.type) return

  // forward to content scripts
  const { id: tabId } = await getActiveTab()
  if (tabId) {
    chrome.tabs.sendMessage(tabId, msg).catch(() => null)
  }

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
      runner.session = undefined
      break
    case 'NOTIFY':
      // forward audio
      if (msg.audio) {
        handleMessage({
          type: 'AUDIO',
          audio: msg.audio
        })
      }
      break
    case 'AUDIO':
      // create offscreen document for audio autoplay
      chrome.offscreen.createDocument({
        url: '/offscreen.html?audio=' + msg.audio,
        reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
        justification: 'autoplay can not play'
      }).catch(() => null)
      break
    case 'TTS':
      // listener in offscreen
      if (msg.kind !== 'text') return

      // create offscreen document for audio autoplay
      chrome.offscreen.createDocument({
        url: '/offscreen.html?tts=' + msg.text,
        reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
        justification: 'autoplay can not play'
      }).catch(() => null)
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
      if (import.meta.env.PROD)
        chrome.runtime.openOptionsPage()
  })
})
