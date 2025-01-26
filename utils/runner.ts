import ky from 'ky'
import {
  Action,
  ActionType,
  PromptEndpointResponse,
  PromptRequest,
  PromptResponse,
} from '@api/types'

export type ActionRunner = (action: Partial<Action>) => void

const Runners: Record<ActionType, ActionRunner> = {
  'GOTO': (action) => {
    window.location.assign(action.target!)
  },
  'BACK': () => {
    window.history.back()
  },
  'IMAGE': () => {

  },
  'ANSWER': () => {
    console.warn('IM GOING TO ANSWER')
  },
  'STOP': () => {
    console.warn('STOPPED')
  },
}

const api = ky.create({
  prefixUrl: 'http://localhost:5000',
  method: 'post',
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

  if (!(type in Runners)) return () => console.error('Runner not found for:', type)

  return Runners[type]
}
