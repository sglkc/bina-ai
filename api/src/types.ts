import { ContentChunk, UsageInfo } from '@mistralai/mistralai/models/components'
import { Request } from 'express'

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

export type PromptEndpointRequest = Request<
  {},
  PromptEndpointResponse,
  Partial<PromptRequest>
>

export type MinifierEndpointRequest = Request<{}, string, string, { iter?: number }>
