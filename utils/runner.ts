import ky from 'ky'
import {
  Action,
  ActionType,
  PromptEndpointResponse,
  PromptRequest,
  PromptResponse,
} from '@api/types'

export type ActionRunner = (action: Partial<Action>) => boolean

const Runners: Record<ActionType, ActionRunner> = {
  'GOTO': (action) => {
    window.location.assign(action.target!)
    return true
  },
  'BACK': () => {
    window.history.back()
    return true
  },
  'IMAGE': () => {
    return false
  },
  'ANSWER': () => {
    console.warn('IM GOING TO ANSWER')
    return false
  },
  'STOP': () => {
    console.warn('STOPPED')
    return false
  },
}

const api = ky.create({
  prefixUrl: 'http://localhost:5000',
  method: 'post',
  timeout: 30_000
})

export async function getAction(body: Partial<PromptRequest>): Promise<PromptResponse> {
  const res = await api<PromptEndpointResponse>('prompt', { json: body }).json()

  if ('message' in res) {
    return { action: 'STOP', intent: 'API error occured', target: res.message }
  }

  return res
}

export function getActionRunner(action: Action): ActionRunner {
  const type = action.action

  if (!(type in Runners)) return () => {
    console.error('Runner not found for:', type)
    return false
  }

  return Runners[type]
}
