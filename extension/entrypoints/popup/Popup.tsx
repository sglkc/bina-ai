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
    sendMessage({ type: 'NOTIFY', message: __('notification.running_ai'), audio: 'next_step' })
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
        class="b-2 b-gray-600 rounded-lg p-3 text-lg shadow-sm focus:ring-2 focus:ring-blue-500"
        placeholder={__('placeholder.command_input')}
        rows={4}
      />

      <SpeechRecognition auto={auto} input={input} process={process} />

      <div class="b b-gray-600 rounded-lg bg-yellow-100 shadow-sm text-base">
        <label class="p-3 flex items-center gap-3">
          <input
            type="checkbox"
            onClick={toggleTts}
            defaultChecked={auto}
            class="h-5 w-5"
          />
          <span class="fw-bold text-gray-700">{__('label.auto_speech')}</span>
        </label>
      </div>

      <hr class="my-2 b-gray-300" />

      <Button
        class="bg-green-600 on:bg-green-800"
        type="submit"
        onClick={process}
      >
        <div class="i-mdi:check-bold text-2xl"></div> {__('button.run_command')}
      </Button>

      <Button
        class="bg-purple-500 on:bg-purple-700"
        onClick={reset}
      >
         <div class="i-mdi:restart text-2xl"></div> {__('button.reset')}
      </Button>

      <Button
        class="bg-gray-500 on:bg-gray-700"
        type="submit"
        onClick={shutupTTS}
      >
        <div class="i-mdi:volume-off text-2xl"></div> {__('button.stop_speech')}
      </Button>
    </div>
  )
}
