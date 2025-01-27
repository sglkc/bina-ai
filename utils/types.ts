export interface PromptMessage {
  type: 'PROMPT'
  prompt?: string
}

export interface ResetMessage {
  type: 'RESET-SESSION'
}

export interface NotifyMessage {
  type: 'NOTIFY'
  message: string
}

export type Message = PromptMessage | ResetMessage | NotifyMessage
