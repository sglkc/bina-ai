import { useRef, useState } from 'preact/hooks'
import SpeechRecognition from './components/SpeechRecognition'
import Button from './components/Button'

const sendMessage = (obj: Message) => chrome.runtime.sendMessage<Message>(obj).catch(() => null)

const reset = () => {
  sendMessage({ type: 'TTS', kind: 'stop' })
  sendMessage({ type: 'RESET-SESSION' })
  sendMessage({ type: 'STOP' })
}

export default function Popup() {
  const input = useRef<HTMLTextAreaElement>(null)

  const process = () => {
    sendMessage({ type: 'NOTIFY', message: __('notification.running_ai'), audio: 'next_step' })
    sendMessage({ type: 'PROMPT', prompt: input.current!.value })
  }

  return (
    <div class="min-w-64 m-4 grid gap-4">
      <header class="flex justify-between">
        <h1 class="text-2xl fw-bold">BINA AI</h1>
      </header>

      <textarea
        ref={input}
        class="b-2 b-black rounded-lg p-3 text-lg shadow-sm focus:ring-2 focus:ring-blue-500"
        placeholder={__('placeholder.command_input')}
        rows={4}
      />

      <SpeechRecognition input={input} process={process} />

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
