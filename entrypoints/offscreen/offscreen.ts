function playAudio(src: string) {
  const audio = new Audio()

  // try to play from local file, if not then should be remote
  try {
    audio.src = chrome.runtime.getURL('/audio/' + src + '.mp3')
  } catch {
    audio.src = src
  }

  audio.play()
  return audio
}

// use global audio for pausing
const tts = new Audio()
const url = new URL('https://tts-api.netlify.app')
let language = 'en'

url.searchParams.set('speed', '1.25')

// its possible to pass response function from message listener
// but can't handle tts on init
const returnListener =  () => {
  chrome.runtime.sendMessage<TTSMessage>({
    type: 'TTS',
    kind: 'done',
  }).catch(() => null)
}

tts.addEventListener('ended', returnListener)
tts.addEventListener('error', returnListener)

function playTTS(text: string) {
  url.searchParams.set('text', text)
  url.searchParams.set('lang', language)

  tts.src = url.toString()
  tts.play()
}

// AUDIO & TTS message listener
chrome.runtime.onMessage.addListener((msg: Message, sender) => {
  if (
    typeof msg !== 'object' ||
      sender.id !== chrome.runtime.id ||
      !msg.type
  ) return

  if (msg.type === 'AUDIO' && msg.audio) {
    console.log(msg)
    playAudio(msg.audio)
    return
  }

  if (msg.type === 'TTS') {
    if (msg.kind === 'text') playTTS(msg.text)
    if (msg.kind === 'stop') tts.pause()
    return
  }
})

// play temp sound on init
{
  const params = new URLSearchParams(location.search)
  const audio = params.get('audio')
  const tts = params.get('tts')
  const lang = params.get('lang')

  if (audio) playAudio(audio)
  if (tts) playTTS(tts)
  if (lang) language = lang
}
