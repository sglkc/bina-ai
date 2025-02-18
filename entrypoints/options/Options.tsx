import { render } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import '@unocss/reset/tailwind-compat.css'
import 'virtual:uno.css'

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
        const message = 'Sukses! Penggunaan mikrofon telah diizinkan. ' +
          'Gunakan kombinasi Ctrl+Shift+1 untuk memulai navigasi'

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
            message += 'Mikrofon tidak dapat ditemukan'
            break
          case 'NotReadableError':
            message += 'Mikrofon diizinkan, namun tidak dapat digunakan'
            break
          case 'NotAllowedError':
            message += 'Mikrofon tidak diizinkan, silahkan mengulang perizinan dari pengaturan'
            break
          case 'SecurityError':
            message += 'Tidak bisa memberi izin, gunakan HTTPS'
            break
        }

        bg.current?.classList.add('bg-red-300')
        sendTTS({ type: 'TTS', kind: 'text', text: message })
        setMessage(message)
      })
  }

  useEffect(() => {
    if (localStorage.getItem('has-mic')) {
      const message = 'Anda sudah memberikan izin mikrofon'

      bg.current?.classList.add('bg-green-300')
      setMessage(message)
      sendTTS({ type: 'TTS', kind: 'stop' })
      sendTTS({ type: 'TTS', kind: 'text', text: message })
    }

    bg.current?.click()
    sendTTS({
      type: 'TTS',
      kind: 'text',
      text: 'Untuk penggunaan pertama, mohon izinkan penggunaan mikrofon.' +
        ' Anda bisa menekan tombol Tab sebanyak 3 kali dan tekan tombol Enter',
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
      { message ?? 'Klik Izinkan untuk menggunakan mikrofon, Anda bisa menggunakan Tab sebanyak 3x dan Enter' }
    </button>
  )
}

render(<App />, document.getElementById('root')!)
