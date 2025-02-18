import { useRef, useState } from 'preact/hooks'
import SpeechRecognition from './components/SpeechRecognition'

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

      <div class="border border-gray-300 rounded-lg p-3 bg-yellow-50 shadow-sm text-base">
        <label class="flex items-center gap-3">
          <input
            type="checkbox"
            onClick={toggleTts}
            defaultChecked={auto}
            class="form-checkbox h-5 w-5 text-blue-600"
          />
          <span class="text-gray-700">TTS otomatis?</span>
        </label>
      </div>

      <button
        class="w-full py-3 bg-red-500 text-white text-xl rounded-lg shadow hover:bg-red-600 transition duration-300"
        type="submit"
        onClick={process}
      >
        Proses
      </button>

      <button
        class="w-full py-3 bg-blue-500 text-white text-lg rounded-lg shadow hover:bg-blue-600 transition duration-300"
        onClick={reset}
      >
        Reset
      </button>
    </div>
  )
}
