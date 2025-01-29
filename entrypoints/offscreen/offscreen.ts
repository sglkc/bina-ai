function playAudio(src: string) {
  // try to play from local file, if not then should be remote
  const audioUrl = chrome.runtime.getURL('/audio/' + src + '.mp3')

  try {
    new Audio(audioUrl).play()
  } catch {
    new Audio(src).play()
  }
}

chrome.runtime.onMessage.addListener((msg: Message, sender) => {
  if (
    typeof msg !== 'object' ||
      sender.id !== chrome.runtime.id ||
      !('audio' in msg) ||
      !msg.audio
  ) return

  playAudio(msg.audio)
})

// play temp sound on init
const lastAudio = new URLSearchParams(location.search).get('audio')

if (lastAudio) playAudio(lastAudio)
