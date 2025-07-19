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
      <textarea
        ref={input}
        class="b-2 b-gray-600 rounded-lg p-3 text-lg shadow-sm focus:ring-2 focus:ring-blue-500"
        placeholder={__('placeholder.command_input')}
        rows={4}
      />

      <SpeechRecognition input={input} process={process} />

      <Button
        class="bg-green-600 on:bg-green-800 text-sm!"
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

    </div>
  )
}
