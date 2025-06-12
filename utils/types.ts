import { ContentChunk, UsageInfo } from '@mistralai/mistralai/models/components'

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

export type ActionType = 'GOTO' | 'BACK' | 'IMAGE' | 'ANSWER' | 'STOP'

export interface Action {
  intent: string
  action: ActionType
  target?: string
}

export interface PromptRequest {
  session?: string
  url: string
  page: string
  prompt: string
  image?: string
}

export interface PromptResponse extends Action {
  session?: string
  usage?: UsageInfo
}

export type PromptContent = string | ContentChunk[]

export type PromptEndpointResponse = PromptResponse | { message: string }
