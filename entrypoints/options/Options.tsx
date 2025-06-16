import { render } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import '@unocss/reset/tailwind-compat.css'
import 'virtual:uno.css'
import APIKey from './APIKey'

// TODO: Text-to-speech instructions
function App() {
  const bg = useRef<HTMLButtonElement>(null)
  const [message, setMessage] = useState<string>()

  const sendTTS = (obj: TTSMessage) => chrome.runtime.sendMessage(obj).catch(() => null)

  const requestPermission = () => {
    sendTTS({ type: 'TTS', kind: 'stop' })

    if (message) return

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const message = __('permission.success')

        localStorage.setItem('has-mic', 'true')
        stream.getTracks().forEach((track) => track.stop())
        bg.current?.classList.add('bg-green-300')

        setMessage(message)
        sendTTS({ type: 'TTS', kind: 'text', text: message })
          .then(() => {
            // TODO: open user's default page
            setTimeout(() => {
              location.assign('https://google.com')
            }, 5000)
            // chrome.action.openPopup()
          })
      })
      .catch((error: DOMException) => {
        let message = error.name + ': '

        switch (error.name) {
          case 'NotFoundError':
            message += __('permission.error.not_found')
            break
          case 'NotReadableError':
            message += __('permission.error.not_readable')
            break
          case 'NotAllowedError':
            message += __('permission.error.not_allowed')
            break
          case 'SecurityError':
            message += __('permission.error.security')
            break
        }

        bg.current?.classList.add('bg-red-300')
        sendTTS({ type: 'TTS', kind: 'text', text: message })
        setMessage(message)
      })
  }

  useEffect(() => {
    if (localStorage.getItem('has-mic')) {
      const message = __('permission.already_granted')

      bg.current?.classList.add('bg-green-300')
      setMessage(message)
      sendTTS({ type: 'TTS', kind: 'stop' })
      sendTTS({ type: 'TTS', kind: 'text', text: message })
    }

    bg.current?.click()
    sendTTS({
      type: 'TTS',
      kind: 'text',
      text: __('permission.request'),
    })
  }, [])

  return (
    <button
      ref={bg}
      class="px-8 py-16 w-screen h-100svh text-4xl text-center fw-bold leading-16"
      onClick={requestPermission}
      disabled={Boolean(message)}
    >
      <hr class="hidden bg-green-300 bg-red-300" />
      { message ?? __('permission.click_allow') }
    </button>
  )
}

function Main() {
  const [hasApiKey, setHasApiKey] = useState<boolean>(false)

  useEffect(() => {
    // Check if API key exists in chrome.storage.local
    chrome.storage.local.get(['mistral_api_key']).then((result) => {
      setHasApiKey(Boolean(result.mistral_api_key))
    })
  }, [])

  const onApiKeySet = () => {
    setHasApiKey(true)
  }

  if (!hasApiKey) {
    return <APIKey onApiKeySet={onApiKeySet} />
  }

  return <App />
}

render(<Main />, document.getElementById('root')!)
