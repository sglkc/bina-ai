import { RefObject } from 'preact'
import { MutableRef, useEffect, useState } from 'preact/hooks'
import Button from './Button'

export interface SpeechRecognitionProps {
  input: RefObject<HTMLTextAreaElement>
  speechRecognition: MutableRef<SpeechRecognition>
  process: () => void
}

export default function SpeechRecognition({
  input,
  speechRecognition,
  process,
}: SpeechRecognitionProps) {
  const [isListening, setIsListening] = useState<boolean>(false)

  const sendMessage = (obj: Message) => chrome.runtime.sendMessage<Message>(obj)
    .catch(() => null)

  const listen = () => {
    try {
      speechRecognition.current?.start()
    } catch {
      speechRecognition.current?.stop()
    }
  }

  useEffect(() => {
    if (!speechRecognition.current) return

    const recognition = speechRecognition.current
    recognition.lang = 'id'
    // recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 0

    recognition.addEventListener('audiostart', async () => {
      setIsListening(true)
      sendMessage({
        type: 'NOTIFY',
        message: __('notification.listening'),
        audio: 'listen',
      })
    })

    recognition.addEventListener('audioend', async () => {
      setIsListening(false)
      sendMessage({
        type: 'NOTIFY',
        message: __('notification.finished_listening'),
        audio: 'finish'
      })

      if (input.current?.value.length) process()
    })

    recognition.addEventListener('error', async (err) => {
      console.error('error!', err)
      setIsListening(false)

      if (err.error === 'not-allowed') {
        chrome.runtime.openOptionsPage()
        return
      }

      sendMessage({
        type: 'NOTIFY',
        message: __('notification.speech_recognition_error', [err.error]),
        audio: 'error'
      })
    })

    recognition.addEventListener('result', async (e) => {
      // const final = e.results[e.resultIndex][0].transcript
      const all = Array.from(e.results).map((s) => s[0].transcript.trim()).join(' ').trim()

      if (!input.current) return

      input.current.value = all
    })

    // command listener for auto toggle
    chrome.commands.onCommand.addListener((command) => {
      if (command === 'open-popup') {
        listen()
      }
    })
  }, [])

  return (
    <Button
      class="mx-auto bg-red-500 on:bg-red-700"
      onClick={listen}
      icon={isListening ? 'i-mdi:microphone-off' : 'i-mdi:microphone'}
    >
      <p class="fw-bold">
        {isListening ? __('button.stop_microphone') : __('button.start_microphone')}
      </p>
      <small class="text-xs">Ctrl + Shift + 1</small>
    </Button>
  )
}
