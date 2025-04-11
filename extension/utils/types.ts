type AudioName = 'finish' | 'listen' | 'next_step' | 'process' | 'error'

export interface StopMessage {
  type: 'STOP'
}

export interface PromptMessage {
  type: 'PROMPT'
  prompt?: string
}

export interface ResetMessage {
  type: 'RESET-SESSION'
}

export interface NotifyMessage {
  type: 'NOTIFY'
  audio?: AudioName
  message: string
}

export interface AudioMessage {
  type: 'AUDIO'
  audio?: AudioName
}

interface TTSTextMessage {
  type: 'TTS'
  kind: 'text'
  text: string
}

interface TTSKindMessage {
  type: 'TTS'
  kind: 'done' | 'stop'
}

export type TTSMessage = TTSTextMessage | TTSKindMessage

export type Message = StopMessage
  | PromptMessage
  | ResetMessage
  | NotifyMessage
  | AudioMessage
  | TTSMessage
