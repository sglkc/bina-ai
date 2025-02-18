import { RefObject } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'

export interface SpeechRecognitionProps {
  auto: boolean
  input: RefObject<HTMLTextAreaElement>
  process: () => void
}

export default function SpeechRecognition({
  auto,
  input,
  process,
}: SpeechRecognitionProps) {
  const [isListening, setIsListening] = useState<boolean>(false)
  const speechRecognition = useRef<SpeechRecognition>(null)

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
    if (!speechRecognition.current) {
      speechRecognition.current = new webkitSpeechRecognition()
    }

    const recognition = speechRecognition.current
    recognition.lang = 'id'
    // recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 0

    recognition.addEventListener('audiostart', async () => {
      setIsListening(true)
      sendMessage({
        type: 'NOTIFY',
        message: 'Listening to microphone',
        audio: 'listen',
      })
    })

    recognition.addEventListener('audioend', async () => {
      setIsListening(false)
      sendMessage({
        type: 'NOTIFY',
        message: 'Finished listening',
        audio: 'finish'
      })

      if (auto) process()
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
        message: 'Speech recognition error: ' + err.error,
        audio: 'error'
      })
    })

    recognition.addEventListener('result', async (e) => {
      // const final = e.results[e.resultIndex][0].transcript
      const all = Array.from(e.results).map((s) => s[0].transcript.trim()).join(' ').trim()

      if (!input.current) return

      input.current.value = all
    })

    // auto tts if checked
    if (auto) listen()

    // command listener for auto toggle
    chrome.commands.onCommand.addListener((command) => {
      if (command === 'open-popup') {
        listen()
      }
    })
  }, [])

  return (
    <button
      class="mx-auto py-3 px-6 bg-red-500 font-bold text-white text-lg rounded-full shadow hover:bg-red-600 transition duration-300"
      onClick={listen}
    >
      {isListening ? 'Stop Mic' : 'Start Mic'}
    </button>
  )
}
