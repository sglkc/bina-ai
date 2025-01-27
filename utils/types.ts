type AudioName = 'finish' | 'listen' | 'next_step' | 'process'

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

export type Message = PromptMessage | ResetMessage | NotifyMessage | AudioMessage
