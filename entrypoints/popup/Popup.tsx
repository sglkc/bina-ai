import { useRef, useEffect } from 'preact/hooks'
import SpeechRecognition from './components/SpeechRecognition'
import Button from './components/Button'
import { runningStorage } from '../../utils/storage'

const sendMessage = (obj: Message) => chrome.runtime.sendMessage<Message>(obj).catch(() => null)

const reset = () => {
  sendMessage({ type: 'TTS', kind: 'stop' })
  sendMessage({ type: 'RESET-SESSION' })
  sendMessage({ type: 'STOP' })
}

export default function Popup() {
  const input = useRef<HTMLTextAreaElement>(null)
  const speechRecognition = useRef<SpeechRecognition>(new webkitSpeechRecognition())

  const process = () => {
    sendMessage({ type: 'NOTIFY', message: __('notification.running_ai'), audio: 'next_step' })
    sendMessage({ type: 'PROMPT', prompt: input.current!.value })
  }

  useEffect(() => {
    // Check runner status on mount, if not running then auto listen mic
    runningStorage.getValue().then((active) => {
      if (active) return
      speechRecognition.current?.start()
    })
  }, [])

  return (
    <div class="min-w-64 m-4 grid gap-4">
      <header class="flex justify-between">
        <h1 class="text-2xl fw-bold">BINA AI</h1>
      </header>

      <textarea
        ref={input}
        class="ring-2 ring-black rounded-lg p-3 text-lg shadow-sm transition-border b-yellow-300 on:b-6"
        placeholder={__('placeholder.command_input')}
        rows={4}
      />

      <SpeechRecognition
        input={input}
        process={process}
        speechRecognition={speechRecognition}
      />

      <Button
        class="bg-green-500 on:bg-green-700"
        icon="i-mdi:play"
        type="submit"
        onClick={process}
      >
        <p class="fw-bold">{__('button.run_command')}</p>
        <small class="text-xs">Ctrl + Shift + 2</small>
      </Button>

      <Button
        class="bg-blue-500 on:bg-blue-700"
        icon="i-mdi:restart"
        onClick={reset}
      >
        <p class="fw-bold">{__('button.reset')}</p>
        <small class="text-xs">Ctrl + Shift + 3</small>
      </Button>

    </div>
  )
}
