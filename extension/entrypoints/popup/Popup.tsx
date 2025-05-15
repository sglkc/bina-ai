import { useRef, useState } from 'preact/hooks'
import SpeechRecognition from './components/SpeechRecognition'
import Button from './components/Button'

const sendMessage = (obj: Message) => chrome.runtime.sendMessage<Message>(obj).catch(() => null)

const shutupTTS = () => sendMessage({ type: 'TTS', kind: 'stop' })

const reset = () => {
  sendMessage({ type: 'RESET-SESSION' })
  sendMessage({ type: 'STOP' })
}

export default function Popup() {
  const [auto, setAuto] = useState<boolean>(!!localStorage.getItem('auto-tts'))
  const input = useRef<HTMLTextAreaElement>(null)

  const process = () => {
    sendMessage({ type: 'NOTIFY', message: 'Running agent', audio: 'next_step' })
    sendMessage({ type: 'PROMPT', prompt: input.current!.value })
  }

  const toggleTts = () => {
    setAuto((state) => {
      if (state) {
        localStorage.removeItem('auto-tts')
      } else {
        localStorage.setItem('auto-tts', 'true')
      }

      return !!localStorage.getItem('auto-tts')
    })
  }

  return (
    <div class="min-w-64 m-4 grid gap-4">
      <textarea
        ref={input}
        class="border border-gray-300 rounded-lg p-3 text-lg shadow-sm focus:ring-2 focus:ring-blue-500"
        placeholder="Isi dengan perintah atau pertanyaan"
        rows={4}
      />

      <SpeechRecognition auto={auto} input={input} process={process} />

      <div class="border border-gray-300 rounded-lg p-3 bg-yellow-100 shadow-sm text-base">
        <label class="flex items-center gap-3">
          <input
            type="checkbox"
            onClick={toggleTts}
            defaultChecked={auto}
            class="h-5 w-5"
          />
          <span class="fw-bold text-gray-700">Ucapan otomatis?</span>
        </label>
      </div>

      <Button
        class="bg-violet-700 hover:bg-red-600"
        type="submit"
        onClick={process}
      >
        <div class="i-mdi:check-bold text-2xl"></div> Jalankan Perintah
      </Button>

      <Button
        class="bg-purple-500 hover:bg-blue-600"
        onClick={reset}
      >
         <div class="i-mdi:restart text-2xl"></div> Ulangi
      </Button>
    </div>
  )
}
