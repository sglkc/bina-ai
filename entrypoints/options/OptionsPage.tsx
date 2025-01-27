import { render } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import '@unocss/reset/tailwind-compat.css'
import 'virtual:uno.css'

// TODO: Text-to-speech instructions
function App() {
  const bg = useRef<HTMLButtonElement>(null)
  const [message, setMessage] = useState<string>()

  const requestPermission = () => {
    if (message) return

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        stream.getTracks().forEach((track) => track.stop())
        setMessage('Sukses! Penggunaan mikrofon telah diizinkan')
        localStorage.setItem('has-mic', 'true')
        bg.current?.classList.add('bg-green-300')
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
        setMessage(message)
      })
  }

  useEffect(() => {
    if (localStorage.getItem('has-mic')) {
      bg.current?.classList.add('bg-green-300')
      setMessage('Sudah ada izin!')
    }

    bg.current?.click()
  }, [])

  return (
    <button
      ref={bg}
      class="px-8 py-16 w-screen h-100svh text-4xl text-center fw-bold leading-16"
      onClick={requestPermission}
    >
      <hr class="hidden bg-green-300 bg-red-300" />
      { message ?? 'Press "Allow" to enable microphone access for text-to-speech!' }
    </button>
  )
}

render(<App />, document.getElementById('root')!)
