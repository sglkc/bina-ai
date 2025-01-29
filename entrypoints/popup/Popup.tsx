import { useEffect, useRef, useState } from 'preact/hooks'
import { Message } from '@utils/types'

export default function Popup() {
  const [isListening, setIsListening] = useState<boolean>(false)
  const speechRecognition = useRef<SpeechRecognition>(null)
  const input = useRef<HTMLTextAreaElement>(null)

  const sendMessage = (obj: Message) => chrome.runtime.sendMessage<Message>(obj).catch(() => null)
  const resetInput = () => input.current!.value = ''
  const resetSession = () => sendMessage({ type: 'RESET-SESSION' })
  const shutupTTS = () => sendMessage({ type: 'TTS', kind: 'stop' })
  const process = () => {
    sendMessage({ type: 'NOTIFY', message: 'Running agent', audio: 'next_step' })
    sendMessage({ type: 'PROMPT', prompt: input.current!.value })
  }

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
    recognition.continuous = true
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

      // kirim hasil prompt
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
  }, [])

  return (
    <div class="h-full w-full">
      <textarea
        ref={input}
        class="b-2 b-black p-2 text-xl"
        placeholder="Isi dengan perintah atau pertanyaan"
        rows={3}
      />
      <button class="b-2 b-black p-4 w-full bg-red text-xl" onClick={listen}>
        { isListening ? 'Stop Mic' : 'Start Mic' }
      </button>
      <button
        class="b-2 b-black p-8 w-full bg-red text-2xl fw-bold"
        type="submit"
        onClick={process}
      >
        GASKAN!
      </button>
      <button
        class="b-2 b-black p-4 w-full bg-red-200 text-lg"
        onClick={shutupTTS}
      >
        Hentikan TTS!!!
      </button>
      <button
        class="b-2 b-black p-4 w-full bg-gray text-lg"
        type="reset"
        onClick={resetInput}
      >
        Hapus prompt
      </button>
      <button
        class="b-2 b-black p-4 w-full bg-blue text-lg"
        onClick={resetSession}
      >
        Start new session
      </button>
    </div>
  );
}
